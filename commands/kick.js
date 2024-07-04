const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for kicking the user')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to kick members.', ephemeral: true });
        }

        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
        if (!botMember.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ content: 'Sorry, I do not have the permission to kick members.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(target.id);
        if (member) {
            try {
                await member.kick(reason);
                await interaction.reply({ content: `Successfully kicked ${target.tag}.`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: `Failed to kick ${target.tag}.`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'User not found in the server.', ephemeral: true });
        }
    },
};
