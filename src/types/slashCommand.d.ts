import { ApplicationCommandData, Interaction } from 'discord.js';

export interface slashCommand extends ApplicationCommandData {
  async execute(interaction: Interaction): Promise<unknown>
}
