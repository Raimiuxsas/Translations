const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the XP leaderboard')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of users to show (default: 10)')
                .setRequired(false)
                .setMinValue(5)
                .setMaxValue(25)
        ),
    async execute(interaction, database) {
        const limit = interaction.options.getInteger('limit') || 10;
        const leaderboard = database.getLeaderboard(limit);
        
        if (leaderboard.length === 0) {
            await interaction.reply('No users have earned XP yet!');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🏆 XP Leaderboard')
            .setDescription('Top users by XP')
            .setTimestamp();
        
        let description = '';
        for (let i = 0; i < leaderboard.length; i++) {
            const user = leaderboard[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            try {
                const discordUser = await interaction.client.users.fetch(user.userId);
                description += `${medal} **${discordUser.username}** - Level ${user.level} (${user.xp} XP)\n`;
            } catch (error) {
                description += `${medal} Unknown User - Level ${user.level} (${user.xp} XP)\n`;
            }
        }
        
        embed.setDescription(description);
        await interaction.reply({ embeds: [embed] });
    },
};
