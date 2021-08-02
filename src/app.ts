import { config } from 'dotenv';
import '@sapphire/plugin-logger/register';

import MhoClient from './lib/MhoClient.js';
import slashCommandHandler from './lib/slashCommands.js';

config();

const client = new MhoClient({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
  ],
  defaultPrefix: '&',
});

client.login(process.env.BOT_TOKEN).then(() => {
  slashCommandHandler(client);
});

export default client;
