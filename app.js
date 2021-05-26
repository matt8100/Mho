// Dependencies
require('dotenv').config();
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const client = new Commando.Client({
  owner: '115661304831803393',
});

// SQLite database
client.db = new sqlite3.Database('database.db');

client.setProvider(
  sqlite.open({ filename: 'database.db', driver: sqlite3.Database }).then((db) => new Commando.SQLiteProvider(db)),
).catch(console.error);

// Client configuration
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['school', 'UofT-related commands'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Client login and connect
client.once('ready', () => {
  client.user.setActivity('24/7 experimentally');
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
});

client.on('error', console.error);

client.login(process.env.BOT_TOKEN);
