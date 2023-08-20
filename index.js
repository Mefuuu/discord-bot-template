const { Client, Collection, Events, REST, Routes } = require('discord.js');
const { readdirSync } = require('node:fs');
const { token, intents, partials, clientID } = require('./config');
const table = require('ascii-table');
const moment = require("moment");
const colors = require('colors');
colors.setTheme({
    date: ['bgGray', 'white'],
    success: ['brightGreen', 'bold', 'underline']
});
const log = x => { console.log(`${colors.date(`[${moment().format("DD-MM-YYYY HH:mm:ss")}]`)} ${x}`) };

const client = new Client({ intents, partials });

client.commands = new Collection();

// Slash commands handler
const commands = [];
const ctable = new table('Commands').setHeading('Name', 'Status');
readdirSync('./src/commands').forEach(async file => {
    const cmd = await require(`./src/commands/${file}`);
    if (cmd.data.name) {
        commands.push(cmd.data.toJSON());
        client.commands.set(cmd.data.name, cmd);
        ctable.addRow(cmd.data.name, '✅');
    }
    else {
        ctable.addRow(file.split('.')[0], '❌');
    }
});
console.log(ctable.toString());

// Events handler
readdirSync('./src/events').forEach(async file => {
    const event = await require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
})

// Registering slash commands
const rest = new REST({ version: '10' }).setToken(token);
client.once(Events.ClientReady, async () => {
    try {
        await rest.put(Routes.applicationCommands(clientID), { body: commands });
    } catch (error) {
        console.error(error);
    }
    log(colors.success(`${client.user.username} is ready to make your life better!`));
});

process.on("unhandledRejection", e => { 
    console.log(e);
});
process.on("uncaughtException", e => { 
    console.log(e);
});
process.on("uncaughtExceptionMonitor", e => { 
    console.log(e);
});

module.exports = client;

client.login(token);
