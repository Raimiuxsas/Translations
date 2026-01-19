# Discord XP & Rewards Bot

A Discord bot that tracks XP for users watching/listening to your content in voice channels and allows them to redeem rewards with their earned XP.

## Features

- 🎙️ **Automatic XP Tracking**: Users earn XP for time spent in voice channels
- 📊 **Level System**: Users level up as they earn XP (100 XP per level)
- 🎁 **Reward System**: Users can spend XP to redeem various rewards
- 🏆 **Leaderboard**: View top XP earners
- 👑 **Admin Controls**: Admins can manually grant XP to users

## Setup Instructions

### Prerequisites

- Node.js version 16.9.0 or higher
- A Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under the bot's username, click "Reset Token" and copy the token (keep it secret!)
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
6. Go to the "OAuth2" > "URL Generator" section
7. Select scopes: `bot` and `applications.commands`
8. Select bot permissions: 
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
   - Connect (to voice channels)
   - View Channels
9. Copy the generated URL and use it to invite the bot to your server

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot credentials:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   XP_PER_MINUTE=10
   XP_CHECK_INTERVAL=60000
   ```

   - `DISCORD_BOT_TOKEN`: Your bot token from Step 1
   - `CLIENT_ID`: Your application ID (found in the "General Information" section)
   - `XP_PER_MINUTE`: XP awarded per minute in voice channels (default: 10)
   - `XP_CHECK_INTERVAL`: How often to check and award XP in milliseconds (default: 60000 = 1 minute)

### Step 4: Deploy Commands

Register the slash commands with Discord:

```bash
npm run deploy
```

You should see a success message listing all registered commands.

### Step 5: Start the Bot

```bash
npm start
```

The bot should now be online and ready to track XP!

## Commands

### User Commands

- `/xp [user]` - Check your XP and level (or another user's)
- `/rewards` - View all available rewards and their costs
- `/redeem <reward_id>` - Redeem a reward using your XP
- `/myrewards` - View your redeemed rewards
- `/leaderboard [limit]` - View the XP leaderboard (default top 10)

### Admin Commands

- `/givexp <user> <amount>` - Grant XP to a user (requires Administrator permission)

## How XP Works

### Earning XP

Users automatically earn XP by being in voice channels:
- XP is awarded periodically (default: every minute)
- The amount of XP per minute can be configured in `.env`
- XP is calculated based on time spent in voice channels
- Users earn XP even while muted or deafened

### Leveling Up

- Users start at Level 1 with 0 XP
- Each level requires 100 XP to advance
- Level 2 = 100 XP total
- Level 3 = 200 XP total
- And so on...

When a user levels up, the bot announces it in the server's system channel.

## Default Rewards

The bot comes with these default rewards:

1. **Bronze Badge** - 100 XP - A shiny bronze badge role
2. **Silver Badge** - 500 XP - A prestigious silver badge role
3. **Gold Badge** - 1000 XP - An exclusive gold badge role
4. **Custom Color** - 250 XP - Get a custom color role
5. **VIP Access** - 2000 XP - Access to VIP channels

### Customizing Rewards

Rewards are stored in `data/xp_data.json`. You can edit this file to:
- Change reward names, costs, and descriptions
- Add new rewards
- Remove rewards

The reward structure:
```json
{
  "id": 1,
  "name": "Reward Name",
  "cost": 100,
  "description": "Reward description"
}
```

**Note**: After redeeming a reward, you'll need to manually assign roles or grant access as the bot currently tracks redemptions but doesn't automatically assign roles.

## Data Storage

All XP data and rewards are stored in `data/xp_data.json`. This file includes:
- User XP and levels
- User activity timestamps
- Redeemed rewards
- Available rewards

The data is automatically saved when changes are made.

## Configuration Options

Edit these values in `.env`:

- `XP_PER_MINUTE`: Amount of XP users earn per minute in voice (default: 10)
- `XP_CHECK_INTERVAL`: How often to check and award XP in milliseconds (default: 60000)

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you ran `npm run deploy` to register commands
- Verify the bot has the proper permissions in your server
- Check that the bot is online

### XP not being awarded
- Ensure users are in voice channels
- Check the bot has permission to view voice channels
- Verify the voice state intent is enabled

### Commands not showing up
- Run `npm run deploy` again
- Wait a few minutes for Discord to update
- Try kicking and re-inviting the bot

## Support

For issues or questions, please open an issue on the GitHub repository.

## License

MIT License - Feel free to modify and use this bot for your community!
