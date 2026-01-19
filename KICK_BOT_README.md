# Kick Streaming Bot - XP & Rewards System

A bot for Kick.com that tracks viewer engagement and awards XP to your viewers, allowing them to redeem rewards directly in chat!

## Features

- 🎥 **Watch Time Tracking**: Viewers earn XP for watching your stream
- 💬 **Chat Commands**: Simple commands for checking XP, rewards, and redeeming
- 🏆 **Leaderboard**: See who your most loyal viewers are
- 🎁 **Reward System**: Viewers can redeem rewards with their XP
- 📊 **Level System**: Users level up as they earn XP (100 XP per level)
- 🔄 **No API Required**: Direct connection to Kick chat via WebSocket

## Why Kick Bot?

Unlike Discord bots that require API tokens and permissions, this Kick bot:
- ✅ Connects directly to Kick chat - no API needed
- ✅ Works immediately with just your channel name
- ✅ Tracks viewers automatically based on chat activity
- ✅ Lightweight and easy to set up

## Setup Instructions

### Prerequisites

- Node.js version 16.0.0 or higher
- Your Kick channel username

### Step 1: Install Dependencies

```bash
cd kick-bot
npm install
```

### Step 2: Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your settings:
   ```env
   KICK_CHANNEL=your_channel_name
   XP_PER_MINUTE=5
   XP_CHECK_INTERVAL=60000
   BOT_PREFIX=!
   ```

   - `KICK_CHANNEL`: Your Kick.com channel username
   - `XP_PER_MINUTE`: XP awarded per minute of watching (default: 5)
   - `XP_CHECK_INTERVAL`: How often to award XP in milliseconds (default: 60000 = 1 minute)
   - `BOT_PREFIX`: Command prefix (default: !)

### Step 3: Start the Bot

```bash
npm start
```

You should see:
```
✅ Kick bot connected to channel: your_channel_name
🔄 XP tracking started (awarding 5 XP/min)
```

## Chat Commands

### For All Viewers

- `!xp` or `!level` - Check your XP and level
- `!xp @username` - Check another user's XP
- `!rewards` - View available rewards
- `!redeem <id>` - Redeem a reward by ID
- `!myrewards` - View your redeemed rewards
- `!leaderboard` or `!top` - View top 10 viewers

### For Moderators/Broadcaster

- `!givexp @username <amount>` - Give XP to a viewer
- `!setxp @username <amount>` - Set a viewer's XP to a specific amount

## How It Works

1. **Viewer Activity**: When someone chats, they're marked as active
2. **XP Awards**: Every minute, active viewers earn XP automatically
3. **Commands**: Viewers use chat commands to check stats and redeem rewards
4. **Rewards**: When redeemed, the bot announces it in chat (you handle the actual reward)

## Default Rewards

1. **Emote Unlock** - 100 XP - Unlock a custom emote
2. **Custom Badge** - 250 XP - Get a custom chat badge
3. **VIP Status** - 500 XP - Become a VIP in chat
4. **Shoutout** - 150 XP - Get a shoutout during stream
5. **Game Choice** - 1000 XP - Choose the next game to play

You can customize these in `data/kick_xp_data.json` after first run.

## Example Usage

```
Viewer: !xp
Bot: @Viewer - Level 5 | XP: 450/500 to next level | Total: 450 XP

Viewer: !rewards
Bot: 🎁 Rewards: [1] Emote Unlock (100 XP) ✅ | [2] Custom Badge (250 XP) ✅ | [3] VIP Status (500 XP) ❌

Viewer: !redeem 1
Bot: 🎉 @Viewer redeemed "Emote Unlock" for 100 XP! Remaining XP: 350

Viewer: !leaderboard
Bot: 🏆 Top Viewers: 1. TopFan (2500 XP) | 2. RegularViewer (1800 XP) | 3. CoolPerson (1200 XP)
```

## Data Storage

All data is stored locally in `data/kick_xp_data.json`:
- Viewer XP and levels
- Redeemed rewards
- Activity timestamps

## Customization

### Change XP Rates
Edit `.env`:
```env
XP_PER_MINUTE=10  # Increase for faster progression
```

### Modify Rewards
Edit `data/kick_xp_data.json` after first run:
```json
{
  "rewards": [
    {
      "id": 1,
      "name": "Your Custom Reward",
      "cost": 200,
      "description": "Custom reward description"
    }
  ]
}
```

### Change Command Prefix
Edit `.env`:
```env
BOT_PREFIX=$  # Use $ instead of !
```

## Troubleshooting

**Bot doesn't connect?**
- Check your channel name is spelled correctly
- Make sure the channel exists and is not banned

**XP not being awarded?**
- Users must chat at least once to be tracked
- Check `XP_CHECK_INTERVAL` is set properly
- Verify bot is running (`npm start`)

**Commands not responding?**
- Check the command prefix matches your `.env` setting
- Make sure the bot is connected (check console)

## Advantages Over Discord Bot

| Feature | Kick Bot | Discord Bot |
|---------|----------|-------------|
| API Setup | ❌ Not needed | ✅ Required |
| OAuth/Tokens | ❌ Not needed | ✅ Required |
| Permissions | ❌ Not needed | ✅ Complex setup |
| Setup Time | ~2 minutes | ~10 minutes |
| Direct Chat | ✅ Yes | ❌ Separate app |
| Stream Integration | ✅ Native | ❌ External |

## Going Live Checklist

- [ ] Configure `.env` with your channel name
- [ ] Customize rewards in the code or after first run
- [ ] Start the bot before going live
- [ ] Test commands in chat (!xp, !rewards)
- [ ] Explain the system to your viewers
- [ ] Handle reward redemptions as they come in

## Support

The bot runs alongside your stream. When viewers redeem rewards, you'll see it in chat and can fulfill them manually (give them VIP, do a shoutout, etc.).

---

**Note**: This bot connects to Kick chat and tracks activity. It doesn't require any official API access, making setup incredibly simple!
