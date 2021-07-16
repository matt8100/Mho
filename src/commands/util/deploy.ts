import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandData, Message } from 'discord.js';

@ApplyOptions({
  name: 'deploy',
  description: 'Deploys slash commands',
  cooldownLimit: 2,
  cooldownDelay: 10,
})

export default class extends Command {
  public async run(message: Message) {
    const data:ApplicationCommandData[] = [
      {
        name: 'button',
        description: 'This makes a button!',
        options: [{
          name: 'input',
          type: 'STRING',
          description: 'You can put something for the button to say!',
          required: false,
        }],
      },
      {
        name: 'ephemeral',
        description: 'This makes a message only you can see!',
        options: [{
          name: 'input',
          type: 'STRING',
          description: 'Say something to yourself!',
          required: true,
        }],
      },
      {
        name: 'select',
        description: 'This makes a selection menu!',
      }];
    await this.container.client.guilds.cache.get(message.guild!.id)?.commands.set(data);
  }
}
