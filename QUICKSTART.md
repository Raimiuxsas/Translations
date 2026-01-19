# Quick Start Guide

## Setting Up Your Discord XP Bot in 5 Minutes

### Step 1: Get Your Bot Token

1. Visit https://discord.com/developers/applications
2. Click **"New Application"** and name it (e.g., "XP Rewards Bot")
3. Go to the **"Bot"** tab on the left
4. Click **"Add Bot"** (confirm if asked)
5. Click **"Reset Token"** and copy it immediately (you'll need this!)

### Step 2: Enable Required Settings

Still in the Bot section:
- Scroll down to **"Privileged Gateway Intents"**
- Enable these THREE intents:
  - ✅ Presence Intent
  - ✅ Server Members Intent
  - ✅ Message Content Intent

### Step 3: Get Your Client ID

1. Go to the **"General Information"** tab on the left
2. Copy your **"Application ID"** (this is your Client ID)

### Step 4: Invite Bot to Your Server

1. Go to **"OAuth2"** > **"URL Generator"**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Connect (Voice Channels)
   - ✅ Use Slash Commands
4. Copy the generated URL at the bottom
5. Open the URL in your browser and select your server

### Step 5: Configure the Bot

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Edit `.env` with your details:
```env
DISCORD_BOT_TOKEN=paste_your_bot_token_here
CLIENT_ID=paste_your_client_id_here
XP_PER_MINUTE=10
XP_CHECK_INTERVAL=60000
```

### Step 6: Install and Run

```bash
# Install dependencies
npm install

# Deploy commands to Discord
npm run deploy

# Start the bot
npm start
```

You should see:
```
✅ Bot is ready! Logged in as YourBotName#1234
📊 Serving 1 servers
🔄 Voice XP tracking started (checking every 60s)
```

## Using the Bot

### For Regular Users

Join a voice channel and start earning XP automatically!

**Check Your XP:**
```
/xp
```

**View Available Rewards:**
```
/rewards
```

**Redeem a Reward:**
```
/redeem reward_id:1
```
(Use the number shown next to the reward in `/rewards`)

**See Leaderboard:**
```
/leaderboard
```

**Check Your Redeemed Rewards:**
```
/myrewards
```

### For Admins

**Give XP to Users:**
```
/givexp user:@Username amount:100
```

## Example Workflow

1. **User joins voice channel** → Bot starts tracking time
2. **User stays for 5 minutes** → Earns 50 XP (10 per minute)
3. **User levels up** → Bot announces in chat
4. **User earns 100 XP total** → Can redeem Bronze Badge
5. **User runs `/redeem reward_id:1`** → Redeems Bronze Badge
6. **Admin manually grants role** (bot tracks redemption)

## Tips

- Users earn XP even while muted or deafened
- XP is awarded continuously while in voice channels
- Level up announcements appear in the server's system channel
- All data is saved automatically to `data/xp_data.json`

## Troubleshooting

**Commands don't appear?**
- Run `npm run deploy` again
- Wait 5 minutes for Discord to update
- Re-invite the bot with the correct permissions

**XP not being awarded?**
- Check that voice state intents are enabled
- Verify bot has permission to see voice channels
- Users must be in voice channels (not just text channels)

**Bot offline?**
- Make sure `npm start` is running
- Check your bot token is correct in `.env`
- Verify the token hasn't been reset in the developer portal

## Next Steps

- Customize rewards in `data/xp_data.json`
- Adjust XP rates in `.env`
- Set up roles that match reward names
- Create a dedicated rewards redemption channel
