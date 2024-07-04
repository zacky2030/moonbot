const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for banning the user')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(target.id);
        if (member) {
            try {
                await member.ban({ reason });
                await interaction.reply({ content: `Successfully banned ${target.tag}.`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: `Failed to ban ${target.tag}.`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'User not found in the server.', ephemeral: true });
        }
    },
};
