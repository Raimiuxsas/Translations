require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const Database = require('./utils/database');

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

// Initialize database
const database = new Database();

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️  [WARNING] The command at ${filePath} is missing required "data" or "execute" property.`);
    }
}

// Track users in voice channels for XP
const voiceChannelUsers = new Map();

// Bot ready event
client.once(Events.ClientReady, (c) => {
    console.log(`✅ Bot is ready! Logged in as ${c.user.tag}`);
    console.log(`📊 Serving ${c.guilds.cache.size} servers`);
    
    // Set bot status
    client.user.setActivity('content and earning XP!', { type: ActivityType.Watching });
    
    // Start XP tracking for voice channels
    startVoiceXPTracking();
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, database);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`);
        console.error(error);
        
        const errorMessage = { 
            content: 'There was an error while executing this command!', 
            ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Voice state update - track users joining/leaving voice channels
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const userId = newState.id;
    
    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
        voiceChannelUsers.set(userId, {
            joinedAt: Date.now(),
            channelId: newState.channelId
        });
        console.log(`👤 User ${userId} joined voice channel ${newState.channelId}`);
    }
    
    // User left a voice channel - just remove from tracking, XP is awarded periodically
    if (oldState.channelId && !newState.channelId) {
        voiceChannelUsers.delete(userId);
        console.log(`👤 User ${userId} left voice channel ${oldState.channelId}`);
    }
});

// Periodic XP tracking for users in voice channels
function startVoiceXPTracking() {
    const checkInterval = parseInt(process.env.XP_CHECK_INTERVAL) || 60000; // Default 1 minute
    const xpPerMinute = parseInt(process.env.XP_PER_MINUTE) || 10; // Default 10 XP per minute
    
    // Validate configuration
    if (isNaN(checkInterval) || checkInterval < 10000) {
        console.warn('⚠️  Invalid XP_CHECK_INTERVAL, using default: 60000ms');
    }
    if (isNaN(xpPerMinute) || xpPerMinute < 1) {
        console.warn('⚠️  Invalid XP_PER_MINUTE, using default: 10');
    }
    
    setInterval(() => {
        const now = Date.now();
        
        for (const [userId, userData] of voiceChannelUsers.entries()) {
            const timeInChannel = (now - userData.joinedAt) / 1000 / 60; // minutes
            
            // Award XP every minute
            if (timeInChannel >= 1) {
                const result = database.addXP(userId, xpPerMinute);
                
                // Reset join time for next interval
                voiceChannelUsers.set(userId, {
                    ...userData,
                    joinedAt: now
                });
                
                console.log(`✨ User ${userId} earned ${xpPerMinute} XP (periodic voice tracking)`);
                
                // Notify level up
                if (result.leveledUp) {
                    client.guilds.cache.forEach(guild => {
                        const member = guild.members.cache.get(userId);
                        if (member) {
                            notifyLevelUp(guild, userId, result.level);
                        }
                    });
                }
            }
        }
    }, checkInterval);
    
    console.log(`🔄 Voice XP tracking started (checking every ${checkInterval / 1000}s, awarding ${xpPerMinute} XP/min)`);
}

// Notify user when they level up
async function notifyLevelUp(guild, userId, level) {
    try {
        const member = await guild.members.fetch(userId);
        const systemChannel = guild.systemChannel;
        const botMember = guild.members.me;
        
        if (systemChannel && botMember && systemChannel.permissionsFor(botMember).has('SendMessages')) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎉 Level Up!')
                .setDescription(`Congratulations ${member}! You've reached **Level ${level}**!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
            
            await systemChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error sending level up notification:', error);
    }
}

// Handle errors
client.on(Events.Error, (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('❌ Error: DISCORD_BOT_TOKEN is not set in .env file');
    console.error('Please create a .env file based on .env.example and add your bot token');
    process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
