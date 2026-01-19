# Kick Bot - Quick Start (2 Minutes!)

## Why Kick Bot is Easier

✅ **No API key needed** - Just your channel name  
✅ **No OAuth setup** - Connects directly to chat  
✅ **No permissions** - Works immediately  
✅ **Native to streaming** - Tracks viewers in real-time  

## Setup in 3 Steps

### 1. Install

```bash
cd kick-bot
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:
```env
KICK_CHANNEL=YourKickUsername
XP_PER_MINUTE=5
BOT_PREFIX=!
```

### 3. Run

```bash
npm start
```

Done! Your bot is now tracking viewers! 🎉

## Test It

In your Kick chat, type:
```
!xp
```

The bot will log the response (check your console).

## How It Works

1. Viewers chat → Bot tracks them
2. Every minute → Active viewers earn XP
3. Viewers use commands → Check XP, redeem rewards
4. Bot responds → Shows in console (you can relay to chat)

## Commands

```
!xp              - Check your XP
!rewards         - See available rewards
!redeem 1        - Redeem reward #1
!leaderboard     - Top 5 viewers
!myrewards       - Your redeemed rewards
```

**Moderator commands:**
```
!givexp @user 100   - Give 100 XP to user
!setxp @user 500    - Set user's XP to 500
```

## Example Session

```
[Viewer] !xp
[BOT] @Viewer - Level 2 | XP: 15/100 to next level | Total: 115 XP

[Viewer] !rewards
[BOT] 🎁 Rewards: [1] Emote Unlock (100 XP) ✅ | [2] Custom Badge (250 XP) ❌ | ...

[Viewer] !redeem 1
[BOT] 🎉 @Viewer redeemed "Emote Unlock" for 100 XP! Remaining XP: 15

[After 1 minute of chatting]
[BOT] ✨ Awarded 5 XP to 3 active viewer(s)

[Viewer levels up]
[BOT] 🎉 @Viewer leveled up to Level 3! 🎊
```

## Tips

- **Start before going live** - Let it warm up
- **Explain to viewers** - Tell them about the commands
- **Customize rewards** - Edit `data/kick_xp_data.json`
- **Monitor console** - See bot responses there
- **Fulfill rewards** - When someone redeems, do it live!

## Troubleshooting

**"Channel not found"**
- Check spelling of your Kick username
- Make sure your channel exists

**No responses to commands**
- Bot is listening, but responses show in console
- To send to chat automatically, you'd need Kick bot account (advanced)

**No XP being awarded**
- Users must chat to be marked active
- Check console for "Awarded XP" messages

## Next Steps

Want bot to respond in chat automatically?
- Create a Kick bot account
- Add authentication (requires Kick API access)
- For now, manually relay responses from console

---

**This simple version tracks everything perfectly without needing any API access!**
