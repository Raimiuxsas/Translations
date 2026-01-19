const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myrewards')
        .setDescription('View your redeemed rewards'),
    async execute(interaction, database) {
        const redeemedRewards = database.getUserRedeemedRewards(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('🎁 My Redeemed Rewards')
            .setTimestamp();
        
        if (redeemedRewards.length === 0) {
            embed.setDescription("You haven't redeemed any rewards yet!\n\nUse `/rewards` to see available rewards.");
        } else {
            let description = '';
            redeemedRewards.forEach((reward, index) => {
                const date = new Date(reward.redeemedAt).toLocaleDateString();
                description += `${index + 1}. **${reward.name}** - Redeemed on ${date}\n`;
            });
            embed.setDescription(description);
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
