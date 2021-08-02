import { SapphireClient } from '@sapphire/framework';
import { Collection } from 'discord.js';

import { slashCommand } from '../types/slashCommand';

export default class MhoClient extends SapphireClient {
  slashCommands: Collection<string, slashCommand> = new Collection()
}
