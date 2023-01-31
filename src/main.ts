import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

dotenv.config()

const client = new SapphireClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.login(process.env.BOT_TOKEN);