const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(3000, () => console.log('Server is ready.'));

// Your existing bot code below...
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const loginWithRetry = (retries = 5) => {
    client.login(process.env.TOKEN).catch(error => {
        console.error('Login failed:', error);
        if (retries > 0) {
            console.log(`Retrying login (${retries} attempts left)...`);
            setTimeout(() => loginWithRetry(retries - 1), 5000);
        } else {
            console.log('Max retries reached. Exiting.');
        }
    });
};

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        await client.application.commands.set(commands);
        console.log('Slash commands registered globally.');

        const newGlobalCommands = await client.application.commands.fetch();
        console.log(`Registered ${newGlobalCommands.size} global commands:`);
        newGlobalCommands.forEach(command => console.log(` - ${command.name}`));
    } catch (error) {
        console.error('Error during command registration:', error);
    }
});

client.on('interactionCreate', async interaction => {
    console.log(`Received interaction: ${interaction.commandName}`);

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        await interaction.reply({ content: 'Command not found.', ephemeral: true });
        return;
    }

    try {
        await command.execute(interaction);
        console.log(`Executed command: ${interaction.commandName}`);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
});

loginWithRetry();
