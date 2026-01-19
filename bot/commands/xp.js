const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Check your XP and level')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check XP for')
                .setRequired(false)
        ),
    async execute(interaction, database) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const { xp, level } = database.getXP(targetUser.id);
        
        const xpForNextLevel = level * 100;
        const progress = xp - ((level - 1) * 100);
        const progressBar = createProgressBar(progress, 100);
        
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`📊 XP Stats for ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ Level', value: `${level}`, inline: true },
                { name: '✨ Total XP', value: `${xp}`, inline: true },
                { name: '📈 Progress to Next Level', value: `${progressBar}\n${progress}/100 XP`, inline: false }
            )
            .setFooter({ text: 'Keep watching content to earn more XP!' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};

function createProgressBar(current, max, length = 20) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
