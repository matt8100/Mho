// Dependencies
require('dotenv').config();
const Commando = require('discord.js-commando');
const path = require('path');

const client = new Commando.Client({
  owner: '115661304831803393',
  commandPrefix: '&',
});

// SQLite database
client.db = require('./database');

client.setProvider(
  new Commando.SyncSQLiteProvider(client.db),
).catch(console.error);

// Client configuration
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['school', 'UofT-related commands'],
    ['misc', 'Miscellaneous commands'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Client login and connect
client.once('ready', () => {
  client.user.setActivity('&help', { type: 'LISTENING' });
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
});

client.on('error', console.error);

client.login(process.env.BOT_TOKEN);
