const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('userid');

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to unban members.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `Successfully unbanned user with ID ${userId}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Failed to unban user with ID ${userId}. Make sure the ID is correct and the user is banned.`, ephemeral: true });
        }
    },
};
