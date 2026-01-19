const fs = require('fs');
const path = require('path');

class KickDatabase {
    constructor(filepath = './data/kick_xp_data.json') {
        this.filepath = filepath;
        this.data = { users: {}, rewards: [] };
        this.ensureDataDirectory();
        this.load();
        this.initializeDefaultRewards();
    }

    ensureDataDirectory() {
        const dir = path.dirname(this.filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                const fileData = fs.readFileSync(this.filepath, 'utf8');
                this.data = JSON.parse(fileData);
            }
        } catch (error) {
            console.error('Error loading database:', error);
            this.data = { users: {}, rewards: [] };
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    initializeDefaultRewards() {
        if (!this.data.rewards || this.data.rewards.length === 0) {
            this.data.rewards = [
                { id: 1, name: 'Emote Unlock', cost: 100, description: 'Unlock a custom emote' },
                { id: 2, name: 'Custom Badge', cost: 250, description: 'Get a custom chat badge' },
                { id: 3, name: 'VIP Status', cost: 500, description: 'Become a VIP in chat' },
                { id: 4, name: 'Shoutout', cost: 150, description: 'Get a shoutout during stream' },
                { id: 5, name: 'Game Choice', cost: 1000, description: 'Choose the next game to play' }
            ];
            this.save();
        }
    }

    getUser(username, skipSave = false) {
        const userKey = username.toLowerCase();
        if (!this.data.users[userKey]) {
            this.data.users[userKey] = {
                username: username,
                xp: 0,
                level: 1,
                lastActivity: Date.now(),
                lastChat: Date.now(),
                redeemedRewards: []
            };
            if (!skipSave) {
                this.save();
            }
        }
        return this.data.users[userKey];
    }

    addXP(username, amount) {
        const user = this.getUser(username, true);
        user.xp += amount;
        user.lastActivity = Date.now();
        
        // Level up calculation (100 XP per level)
        const newLevel = Math.floor(user.xp / 100) + 1;
        const leveledUp = newLevel > user.level;
        user.level = newLevel;
        
        this.save();
        return { xp: user.xp, level: user.level, leveledUp };
    }

    setXP(username, amount) {
        const user = this.getUser(username, true);
        user.xp = amount;
        user.level = Math.floor(amount / 100) + 1;
        this.save();
        return { xp: user.xp, level: user.level };
    }

    getXP(username) {
        const user = this.getUser(username);
        return { xp: user.xp, level: user.level };
    }

    updateActivity(username) {
        const user = this.getUser(username, true);
        user.lastChat = Date.now();
        this.save();
    }

    canAfford(username, cost) {
        const user = this.getUser(username);
        return user.xp >= cost;
    }

    spendXP(username, amount) {
        const user = this.getUser(username);
        if (user.xp >= amount) {
            user.xp -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getRewards() {
        return this.data.rewards;
    }

    getReward(rewardId) {
        return this.data.rewards.find(r => r.id === parseInt(rewardId));
    }

    redeemReward(username, rewardId) {
        const user = this.getUser(username);
        const reward = this.getReward(rewardId);
        
        if (!reward) return { success: false, message: 'Reward not found' };
        if (!this.canAfford(username, reward.cost)) {
            return { success: false, message: 'Not enough XP' };
        }
        
        if (this.spendXP(username, reward.cost)) {
            user.redeemedRewards.push({
                rewardId,
                name: reward.name,
                redeemedAt: Date.now()
            });
            this.save();
            return { success: true, reward, remainingXP: user.xp };
        }
        
        return { success: false, message: 'Failed to redeem reward' };
    }

    getLeaderboard(limit = 10) {
        const users = Object.values(this.data.users)
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
        return users;
    }

    getUserRedeemedRewards(username) {
        const user = this.getUser(username);
        return user.redeemedRewards || [];
    }

    getActiveUsers(timeWindowMs = 5 * 60 * 1000) {
        const now = Date.now();
        const threshold = now - timeWindowMs;
        
        return Object.values(this.data.users)
            .filter(user => user.lastChat >= threshold)
            .map(user => user.username);
    }
}

module.exports = KickDatabase;
