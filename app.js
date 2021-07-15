require('dotenv').config();
const { SapphireClient } = require('@sapphire/framework');

const client = new SapphireClient({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
  ],
  defaultPrefix: '&',
});

client.on('ready', () => {
  client.user.setActivity('commands', { type: 'LISTENING' });
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
});

client.login(process.env.BOT_TOKEN);
