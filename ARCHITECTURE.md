# Discord XP Bot Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Discord Server                           │
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │  Text        │         │   Voice      │                      │
│  │  Channel     │         │   Channel    │                      │
│  │              │         │              │                      │
│  │  Users use   │         │  Users join  │                      │
│  │  slash cmds  │         │  and earn XP │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
└─────────┼────────────────────────┼───────────────────────────────┘
          │                        │
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Discord XP Bot                              │
│                                                                   │
│  ┌──────────────────────┐      ┌─────────────────────┐         │
│  │  Command Handler     │      │  Voice Tracker       │         │
│  │                      │      │                      │         │
│  │  • /xp              │      │  • Tracks join time  │         │
│  │  • /rewards         │      │  • Awards XP/min     │         │
│  │  • /redeem          │      │  • Detects level up  │         │
│  │  • /leaderboard     │      │  • Removes on leave  │         │
│  │  • /myrewards       │      │                      │         │
│  │  • /givexp (admin)  │      │  Checks every 60s    │         │
│  └──────────┬───────────┘      └──────────┬──────────┘         │
│             │                             │                     │
│             └──────────┬──────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│             ┌────────────────────┐                              │
│             │  Database Manager  │                              │
│             │                    │                              │
│             │  • User XP data    │                              │
│             │  • Level tracking  │                              │
│             │  • Reward catalog  │                              │
│             │  • Redemptions     │                              │
│             │  • Leaderboard     │                              │
│             └──────────┬─────────┘                              │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  data/           │
              │  xp_data.json    │
              │                  │
              │  JSON File       │
              │  Storage         │
              └──────────────────┘
```

## Component Details

### 1. Voice Tracker
- **Triggers**: User joins/leaves voice channel
- **Action**: 
  - On join: Records timestamp
  - Periodic: Awards XP every minute
  - On leave: Stops tracking
- **XP Award**: Configurable (default 10 XP/min)

### 2. Command Handler
Processes slash commands:

| Command | Access | Function |
|---------|--------|----------|
| /xp | All Users | Display XP and level |
| /rewards | All Users | List available rewards |
| /redeem | All Users | Redeem a reward |
| /myrewards | All Users | View redeemed rewards |
| /leaderboard | All Users | Show top users |
| /givexp | Admins | Manually grant XP |

### 3. Database Manager
Functions:
- `getUser(userId)` - Get or create user
- `addXP(userId, amount)` - Add XP and check level up
- `getXP(userId)` - Get current XP and level
- `redeemReward(userId, rewardId)` - Process redemption
- `getLeaderboard(limit)` - Get top users

### 4. Level System
```
Level 1:   0 - 99 XP
Level 2:   100 - 199 XP
Level 3:   200 - 299 XP
...
Level N:   (N-1)*100 - (N*100)-1 XP
```

## Data Structure

### User Data
```json
{
  "users": {
    "user_id_123": {
      "xp": 250,
      "level": 3,
      "lastActivity": 1768807960000,
      "redeemedRewards": [
        {
          "rewardId": 1,
          "name": "Bronze Badge",
          "redeemedAt": 1768807960000
        }
      ]
    }
  }
}
```

### Reward Data
```json
{
  "rewards": [
    {
      "id": 1,
      "name": "Bronze Badge",
      "cost": 100,
      "description": "A shiny bronze badge role"
    }
  ]
}
```

## Event Flow Examples

### XP Award Flow
```
1. User in voice channel
   ↓
2. Timer checks (every 60s)
   ↓
3. Time >= 1 minute?
   ↓ Yes
4. Award XP (default 10)
   ↓
5. Calculate new level
   ↓
6. Level up? → Announce in channel
   ↓
7. Reset timer for user
   ↓
8. Save to database
```

### Reward Redemption Flow
```
1. User: /redeem reward_id:1
   ↓
2. Get user's current XP
   ↓
3. Get reward details
   ↓
4. Check: XP >= cost?
   ↓ Yes
5. Deduct XP
   ↓
6. Add to redeemedRewards
   ↓
7. Save to database
   ↓
8. Show success message
```

## Performance Considerations

### Optimization Strategies
1. **Batch Saves**: Group XP updates during high activity
2. **Memory Caching**: Keep active users in memory
3. **Skip Saves**: Don't save on every user creation if followed by XP add
4. **Validation**: Check inputs early to avoid unnecessary DB operations

### Scalability
- ✅ Works for servers up to ~1,000 users
- ✅ JSON file storage sufficient for most use cases
- 🔄 Can be upgraded to SQLite/PostgreSQL for larger servers
- 🔄 Can add Redis caching for high-activity servers

## Security Features

1. **Admin Commands**: Protected by Discord permissions
2. **Input Validation**: All user inputs validated
3. **Error Handling**: Comprehensive try-catch blocks
4. **Safe Defaults**: Fallback to safe values on invalid config
5. **No SQL Injection**: JSON-based storage eliminates SQL risks

## Extension Points

Want to customize? Modify these areas:

1. **Reward Types**: Edit `data/xp_data.json`
2. **XP Rates**: Change `.env` configuration
3. **Level Formula**: Modify `database.js` line ~73
4. **Commands**: Add new files in `bot/commands/`
5. **Tracking**: Modify voice state logic in `bot/index.js`
