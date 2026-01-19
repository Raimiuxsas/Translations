const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewards')
        .setDescription('View available rewards'),
    async execute(interaction, database) {
        const rewards = database.getRewards();
        const userXP = database.getXP(interaction.user.id).xp;
        
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🎁 Available Rewards')
            .setDescription(`You currently have **${userXP} XP**\n\nUse \`/redeem <reward_id>\` to redeem a reward!`)
            .setTimestamp();
        
        rewards.forEach(reward => {
            const canAfford = userXP >= reward.cost ? '✅' : '❌';
            embed.addFields({
                name: `${canAfford} [${reward.id}] ${reward.name} - ${reward.cost} XP`,
                value: reward.description,
                inline: false
            });
        });
        
        await interaction.reply({ embeds: [embed] });
    },
};
