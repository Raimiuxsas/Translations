# Discord XP Bot - Usage Examples

## 🎮 User Experience Examples

### Example 1: First Time User

**User joins a voice channel:**
```
[Bot Console] 👤 User 123456789 joined voice channel 987654321
```

**After 5 minutes in voice:**
```
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)
```

**User checks their XP:**
```
User: /xp
Bot: [Embed showing]
     📊 XP Stats for Username
     ⭐ Level: 1
     ✨ Total XP: 50
     📈 Progress to Next Level
     ██████████░░░░░░░░░░
     50/100 XP
```

### Example 2: Leveling Up

**User has 95 XP and earns 10 more:**
```
[Bot Console] ✨ User 123456789 earned 10 XP (periodic voice tracking)

[Discord Channel]
🎉 Level Up!
Congratulations @Username! You've reached Level 2!
```

**User checks their level:**
```
User: /xp
Bot: [Embed showing]
     📊 XP Stats for Username
     ⭐ Level: 2
     ✨ Total XP: 105
     📈 Progress to Next Level
     █░░░░░░░░░░░░░░░░░░░
     5/100 XP
```

### Example 3: Viewing Rewards

```
User: /rewards
Bot: [Embed showing]
     🎁 Available Rewards
     You currently have 105 XP
     
     Use `/redeem <reward_id>` to redeem a reward!
     
     ✅ [1] Bronze Badge - 100 XP
     A shiny bronze badge role
     
     ❌ [2] Silver Badge - 500 XP
     A prestigious silver badge role
     
     ❌ [3] Gold Badge - 1000 XP
     An exclusive gold badge role
     
     ❌ [4] Custom Color - 250 XP
     Get a custom color role
     
     ❌ [5] VIP Access - 2000 XP
     Access to VIP channels
```

### Example 4: Redeeming a Reward

**User has enough XP:**
```
User: /redeem reward_id:1
Bot: [Embed showing]
     🎉 Reward Redeemed Successfully!
     You have redeemed Bronze Badge
     
     Cost: 100 XP
     Remaining XP: 5 XP
```

**User tries to redeem something they can't afford:**
```
User: /redeem reward_id:5
Bot: [Embed showing - Only visible to user]
     ❌ Redemption Failed
     Not enough XP
```

### Example 5: Viewing My Rewards

```
User: /myrewards
Bot: [Embed showing - Only visible to user]
     🎁 My Redeemed Rewards
     
     1. Bronze Badge - Redeemed on 1/19/2026
```

### Example 6: Checking Leaderboard

```
User: /leaderboard
Bot: [Embed showing]
     🏆 XP Leaderboard
     Top users by XP
     
     🥇 TopGamer - Level 25 (2450 XP)
     🥈 CoolUser - Level 18 (1780 XP)
     🥉 VoiceFan - Level 15 (1450 XP)
     4. RegularUser - Level 12 (1150 XP)
     5. NewPerson - Level 8 (750 XP)
```

## 🛠️ Admin Examples

### Example 1: Granting XP to a User

```
Admin: /givexp user:@NewUser amount:500
Bot: [Embed showing]
     ✨ XP Granted
     Successfully gave 500 XP to @NewUser
     
     New Total XP: 550
     New Level: 6

[Discord Channel]
🎉 Level Up!
Congratulations @NewUser! You've reached Level 6!
```

### Example 2: Checking Another User's XP

```
Admin: /xp user:@SomeUser
Bot: [Embed showing]
     📊 XP Stats for SomeUser
     ⭐ Level: 10
     ✨ Total XP: 950
     📈 Progress to Next Level
     ██████████████████░░
     50/100 XP
```

## 📊 Real-World Usage Scenario

### Community Stream Night

**Setup:**
- Server hosts a weekly game stream
- Users join voice channels to watch together
- XP is awarded automatically

**Timeline:**

**7:00 PM** - Stream starts
```
[Bot Console] 👤 User Alice joined voice channel
[Bot Console] 👤 User Bob joined voice channel
[Bot Console] 👤 User Charlie joined voice channel
```

**7:01 PM** - First XP awarded
```
[Bot Console] ✨ User Alice earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User Bob earned 10 XP (periodic voice tracking)
[Bot Console] ✨ User Charlie earned 10 XP (periodic voice tracking)
```

**7:10 PM** - Bob levels up!
```
🎉 Level Up!
Congratulations @Bob! You've reached Level 5!
```

**9:00 PM** - Stream ends (2 hours later)
```
Alice: /xp
Bot shows: Level 14 (1320 XP total)

Alice: /rewards
Alice: /redeem reward_id:5  [VIP Access - 2000 XP]
Bot: ❌ Not enough XP

Alice: /redeem reward_id:2  [Silver Badge - 500 XP]
Bot: 🎉 Reward Redeemed Successfully!
```

**Leaderboard after stream:**
```
/leaderboard shows:
🥇 Alice - Level 9 (820 XP)
🥈 Bob - Level 5 (410 XP)  
🥉 Charlie - Level 3 (250 XP)
```

## 💡 Tips for Maximum Engagement

1. **Announce the system**: Tell your community about XP rewards
2. **Customize rewards**: Edit rewards in `data/xp_data.json` to match your server roles
3. **Host events**: Stream nights, game nights, or watch parties
4. **Adjust rates**: Increase XP_PER_MINUTE during special events
5. **Celebrate milestones**: Use /givexp to reward community achievements
6. **Show the leaderboard**: Post weekly leaderboards to encourage participation

## 🎯 Configuration Examples

### High Activity Server
```env
XP_PER_MINUTE=15
XP_CHECK_INTERVAL=60000
```
More generous XP for active community

### Casual Server
```env
XP_PER_MINUTE=5
XP_CHECK_INTERVAL=60000
```
Slower progression for relaxed atmosphere

### Event-Based
```env
XP_PER_MINUTE=25
XP_CHECK_INTERVAL=30000
```
Special rates for limited-time events (change back after!)
