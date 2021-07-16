import { config } from 'dotenv';
import { SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';

config();

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

client.login(process.env.BOT_TOKEN);
