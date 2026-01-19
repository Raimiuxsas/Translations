const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('Redeem a reward with your XP')
        .addIntegerOption(option =>
            option.setName('reward_id')
                .setDescription('The ID of the reward to redeem')
                .setRequired(true)
        ),
    async execute(interaction, database) {
        const rewardId = interaction.options.getInteger('reward_id');
        const result = database.redeemReward(interaction.user.id, rewardId);
        
        if (result.success) {
            const { xp, level } = database.getXP(interaction.user.id);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🎉 Reward Redeemed Successfully!')
                .setDescription(`You have redeemed **${result.reward.name}**`)
                .addFields(
                    { name: 'Cost', value: `${result.reward.cost} XP`, inline: true },
                    { name: 'Remaining XP', value: `${xp} XP`, inline: true }
                )
                .setFooter({ text: 'Thank you for your support!' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Redemption Failed')
                .setDescription(result.message)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
