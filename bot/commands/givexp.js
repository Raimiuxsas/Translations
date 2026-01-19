const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givexp')
        .setDescription('Give XP to a user (Admin only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give XP to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of XP to give')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10000)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, database) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        
        const result = database.addXP(targetUser.id, amount);
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✨ XP Granted')
            .setDescription(`Successfully gave **${amount} XP** to ${targetUser}`)
            .addFields(
                { name: 'New Total XP', value: `${result.xp}`, inline: true },
                { name: 'New Level', value: `${result.level}`, inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Notify the user
        if (result.leveledUp) {
            try {
                const channel = interaction.channel;
                const levelUpEmbed = new EmbedBuilder()
                    .setColor(0xFFD700)
                    .setTitle('🎉 Level Up!')
                    .setDescription(`Congratulations ${targetUser}! You've reached **Level ${result.level}**!`)
                    .setTimestamp();
                await channel.send({ embeds: [levelUpEmbed] });
            } catch (error) {
                console.error('Error sending level up message:', error);
            }
        }
    },
};
