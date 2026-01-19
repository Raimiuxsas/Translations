const fs = require('fs');
const path = require('path');

class Database {
    constructor(filepath = './data/xp_data.json') {
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
                { id: 1, name: 'Bronze Badge', cost: 100, description: 'A shiny bronze badge role' },
                { id: 2, name: 'Silver Badge', cost: 500, description: 'A prestigious silver badge role' },
                { id: 3, name: 'Gold Badge', cost: 1000, description: 'An exclusive gold badge role' },
                { id: 4, name: 'Custom Color', cost: 250, description: 'Get a custom color role' },
                { id: 5, name: 'VIP Access', cost: 2000, description: 'Access to VIP channels' }
            ];
            this.save();
        }
    }

    getUser(userId, skipSave = false) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                xp: 0,
                level: 1,
                lastActivity: Date.now(),
                redeemedRewards: []
            };
            // Only save if not skipped (used when immediately followed by another save)
            if (!skipSave) {
                this.save();
            }
        }
        return this.data.users[userId];
    }

    addXP(userId, amount) {
        const user = this.getUser(userId, true); // Skip save here, will save at the end
        user.xp += amount;
        user.lastActivity = Date.now();
        
        // Level up calculation (100 XP per level)
        const newLevel = Math.floor(user.xp / 100) + 1;
        const leveledUp = newLevel > user.level;
        user.level = newLevel;
        
        this.save();
        return { xp: user.xp, level: user.level, leveledUp };
    }

    getXP(userId) {
        const user = this.getUser(userId);
        return { xp: user.xp, level: user.level };
    }

    canAfford(userId, cost) {
        const user = this.getUser(userId);
        return user.xp >= cost;
    }

    spendXP(userId, amount) {
        const user = this.getUser(userId);
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
        return this.data.rewards.find(r => r.id === rewardId);
    }

    redeemReward(userId, rewardId) {
        const user = this.getUser(userId);
        const reward = this.getReward(rewardId);
        
        if (!reward) return { success: false, message: 'Reward not found' };
        if (!this.canAfford(userId, reward.cost)) {
            return { success: false, message: 'Not enough XP' };
        }
        
        if (this.spendXP(userId, reward.cost)) {
            user.redeemedRewards.push({
                rewardId,
                name: reward.name,
                redeemedAt: Date.now()
            });
            this.save();
            return { success: true, reward };
        }
        
        return { success: false, message: 'Failed to redeem reward' };
    }

    getLeaderboard(limit = 10) {
        const users = Object.entries(this.data.users)
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
        return users;
    }

    getUserRedeemedRewards(userId) {
        const user = this.getUser(userId);
        return user.redeemedRewards || [];
    }
}

module.exports = Database;
