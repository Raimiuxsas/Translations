require('dotenv').config();
const Pusher = require('pusher-js');
const https = require('https');
const KickDatabase = require('./utils/database');

// Initialize database
const database = new KickDatabase();

// Configuration with fallbacks
const KICK_CHANNEL = process.env.KICK_CHANNEL;
const BOT_PREFIX = process.env.BOT_PREFIX || '!';
const PUSHER_KEY = process.env.PUSHER_KEY || 'eb1d5f283081a78b932c'; // Kick's public Pusher key
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'us2';

// Parse and validate XP settings
let XP_PER_MINUTE = parseInt(process.env.XP_PER_MINUTE);
let XP_CHECK_INTERVAL = parseInt(process.env.XP_CHECK_INTERVAL);

if (isNaN(XP_PER_MINUTE) || XP_PER_MINUTE < 1) {
    console.warn('⚠️  Invalid XP_PER_MINUTE, using default: 5');
    XP_PER_MINUTE = 5;
}
if (isNaN(XP_CHECK_INTERVAL) || XP_CHECK_INTERVAL < 10000) {
    console.warn('⚠️  Invalid XP_CHECK_INTERVAL, using default: 60000ms');
    XP_CHECK_INTERVAL = 60000;
}

if (!KICK_CHANNEL) {
    console.error('❌ Error: KICK_CHANNEL is not set in .env file');
    console.error('Please create a .env file based on .env.example and add your channel name');
    process.exit(1);
}

let chatRoomId = null;
let pusher = null;

// Get Kick channel info
async function getChannelInfo() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'kick.com',
            path: `/api/v2/channels/${KICK_CHANNEL}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse channel data'));
                    }
                } else {
                    reject(new Error(`Channel not found: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

// Connect to Kick chat
async function connectToKick() {
    try {
        console.log(`🔍 Looking up channel: ${KICK_CHANNEL}...`);
        const channelInfo = await getChannelInfo();
        chatRoomId = channelInfo.chatroom.id;
        
        console.log(`✅ Found channel: ${channelInfo.user.username}`);
        console.log(`💬 Connecting to chat room: ${chatRoomId}...`);

        // Connect to Pusher (Kick uses Pusher for chat)
        pusher = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
            authEndpoint: 'https://kick.com/broadcasting/auth'
        });

        const channelName = `chatrooms.${chatRoomId}.v2`;
        const channel = pusher.subscribe(channelName);

        channel.bind('App\\Events\\ChatMessageEvent', (data) => {
            handleChatMessage(data);
        });

        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Kick bot connected to channel: ${KICK_CHANNEL}`);
            console.log(`🔄 XP tracking started (awarding ${XP_PER_MINUTE} XP/min)`);
            console.log(`📝 Command prefix: ${BOT_PREFIX}`);
            console.log('');
            startXPTracking();
        });

        channel.bind('pusher:subscription_error', (error) => {
            console.error('❌ Subscription error:', error);
        });

    } catch (error) {
        console.error('❌ Error connecting to Kick:', error.message);
        process.exit(1);
    }
}

// Handle chat messages
function handleChatMessage(data) {
    const username = data.sender.username;
    const message = data.content.trim();
    
    // Update user activity
    database.updateActivity(username);
    
    // Check if message is a command
    if (message.startsWith(BOT_PREFIX)) {
        handleCommand(username, message.substring(BOT_PREFIX.length).trim(), data);
    }
}

// Send message to chat (Note: This requires authentication, so we'll just log for now)
function sendChatMessage(message) {
    console.log(`[BOT] ${message}`);
    // In a full implementation, you would need to authenticate and use Kick's API
    // For now, we just log the response
}

// Handle commands
function handleCommand(username, command, data) {
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case 'xp':
        case 'level':
            handleXPCommand(username, args);
            break;
        case 'rewards':
            handleRewardsCommand(username);
            break;
        case 'redeem':
            handleRedeemCommand(username, args);
            break;
        case 'myrewards':
            handleMyRewardsCommand(username);
            break;
        case 'leaderboard':
        case 'top':
            handleLeaderboardCommand();
            break;
        case 'givexp':
            if (isModerator(data.sender)) {
                handleGiveXPCommand(username, args);
            }
            break;
        case 'setxp':
            if (isModerator(data.sender)) {
                handleSetXPCommand(username, args);
            }
            break;
    }
}

// Check if user is moderator or broadcaster
function isModerator(sender) {
    return sender.identity?.badges?.some(b => 
        b.type === 'moderator' || b.type === 'broadcaster' || b.type === 'owner'
    ) || false;
}

// Command handlers
function handleXPCommand(requester, args) {
    let targetUser = requester;
    if (args.length > 1 && args[1].startsWith('@')) {
        targetUser = args[1].substring(1);
    }
    
    const { xp, level } = database.getXP(targetUser);
    const xpToNext = level * 100;
    const progress = xp - ((level - 1) * 100);
    
    sendChatMessage(`@${targetUser} - Level ${level} | XP: ${progress}/${100} to next level | Total: ${xp} XP`);
}

function handleRewardsCommand(username) {
    const rewards = database.getRewards();
    const userXP = database.getXP(username).xp;
    
    const rewardList = rewards.map(r => {
        const canAfford = userXP >= r.cost ? '✅' : '❌';
        return `[${r.id}] ${r.name} (${r.cost} XP) ${canAfford}`;
    }).join(' | ');
    
    sendChatMessage(`🎁 Rewards: ${rewardList}`);
}

function handleRedeemCommand(username, args) {
    if (args.length < 2) {
        sendChatMessage(`@${username} - Usage: ${BOT_PREFIX}redeem <reward_id>`);
        return;
    }
    
    const rewardId = parseInt(args[1]);
    const result = database.redeemReward(username, rewardId);
    
    if (result.success) {
        sendChatMessage(`🎉 @${username} redeemed "${result.reward.name}" for ${result.reward.cost} XP! Remaining XP: ${result.remainingXP}`);
    } else {
        sendChatMessage(`@${username} - ${result.message}`);
    }
}

function handleMyRewardsCommand(username) {
    const rewards = database.getUserRedeemedRewards(username);
    
    if (rewards.length === 0) {
        sendChatMessage(`@${username} - You haven't redeemed any rewards yet!`);
    } else {
        const rewardList = rewards.map((r, i) => `${i + 1}. ${r.name}`).join(' | ');
        sendChatMessage(`@${username} - Your rewards: ${rewardList}`);
    }
}

function handleLeaderboardCommand() {
    const leaderboard = database.getLeaderboard(5);
    
    if (leaderboard.length === 0) {
        sendChatMessage('No users have earned XP yet!');
        return;
    }
    
    const topUsers = leaderboard.map((u, i) => 
        `${i + 1}. ${u.username} (${u.xp} XP)`
    ).join(' | ');
    
    sendChatMessage(`🏆 Top Viewers: ${topUsers}`);
}

function handleGiveXPCommand(moderator, args) {
    if (args.length < 3) {
        sendChatMessage(`Usage: ${BOT_PREFIX}givexp @username <amount>`);
        return;
    }
    
    const targetUser = args[1].startsWith('@') ? args[1].substring(1) : args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount) || amount < 1) {
        sendChatMessage(`Invalid amount. Must be a positive number.`);
        return;
    }
    
    const result = database.addXP(targetUser, amount);
    sendChatMessage(`✨ @${targetUser} received ${amount} XP! New total: ${result.xp} XP (Level ${result.level})`);
}

function handleSetXPCommand(moderator, args) {
    if (args.length < 3) {
        sendChatMessage(`Usage: ${BOT_PREFIX}setxp @username <amount>`);
        return;
    }
    
    const targetUser = args[1].startsWith('@') ? args[1].substring(1) : args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount) || amount < 0) {
        sendChatMessage(`Invalid amount. Must be 0 or greater.`);
        return;
    }
    
    const result = database.setXP(targetUser, amount);
    sendChatMessage(`✨ @${targetUser} XP set to ${result.xp} XP (Level ${result.level})`);
}

// Periodic XP tracking
function startXPTracking() {
    setInterval(() => {
        const activeUsers = database.getActiveUsers(XP_CHECK_INTERVAL + 30000); // Slightly longer window
        
        for (const username of activeUsers) {
            const result = database.addXP(username, XP_PER_MINUTE);
            
            if (result.leveledUp) {
                sendChatMessage(`🎉 @${username} leveled up to Level ${result.level}! 🎊`);
            }
        }
        
        if (activeUsers.length > 0) {
            console.log(`✨ Awarded ${XP_PER_MINUTE} XP to ${activeUsers.length} active viewer(s)`);
        }
    }, XP_CHECK_INTERVAL);
}

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Start the bot
console.log('🚀 Starting Kick XP Bot...');
console.log('');
connectToKick();
