const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');

const UPTIME_ROBOT_API_KEY = process.env.UPTIME_ROBOT_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Add a project link to UptimeRobot for continuous uptime monitoring.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('The URL of the Repl.it or Glitch project')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');

        if (!/^https?:\/\//.test(url)) {
            return interaction.reply({ content: 'Please provide a valid URL.', ephemeral: true });
        }

        const form = new FormData();
        form.append('api_key', UPTIME_ROBOT_API_KEY);
        form.append('format', 'json');
        form.append('type', '1');
        form.append('url', url);
        form.append('friendly_name', `Monitor for ${url}`);

        try {
            const response = await axios.post('https://api.uptimerobot.com/v2/newMonitor', form, {
                headers: form.getHeaders()
            });

            if (response.data.stat === 'ok') {
                await interaction.reply(`Successfully added ${url} to UptimeRobot.`);
            } else {
                await interaction.reply(`Failed to add ${url} to Moon Uptime: ${response.data.error.message}`, { ephemeral: true });
            }
        } catch (error) {
            console.error('Error adding monitor:', error);
            await interaction.reply({ content: 'There was an error adding the monitor. Please try again later.', ephemeral: true });
        }
    },
};
