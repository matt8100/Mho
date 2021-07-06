require('dotenv').config();
const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');

const client = new Commando.Client({
  owner: '115661304831803393',
  commandPrefix: '&',
});

// SQLite database
client.db = require('./config/sqlite');

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

// Event handler
fs.readdirSync('./events').filter((file) => file.endsWith('.js')).forEach((file) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const event = require(`./events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
});

client.login(process.env.BOT_TOKEN);
