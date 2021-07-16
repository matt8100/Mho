import { EventOptions, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import {
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js';

@ApplyOptions<EventOptions>({
  event: 'interactionCreate',
})

export default class extends Listener {
  public async run(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    switch (interaction.commandName) {
      case 'button': {
        const input = interaction.options.get('input')?.value?.toString();
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('primary')
              .setLabel(input || 'Primary')
              .setStyle('PRIMARY'),
          );
        await interaction.reply({ content: 'This is a button!', components: [row] });
        const filter = (i:MessageComponentInteraction) => i.customId === 'primary';
        const collector = interaction.channel?.createMessageComponentCollector({
          filter, time: 15000,
        });
        let count = 0;
        collector?.on('collect', async (i:MessageComponentInteraction) => {
          await i.update({ content: `You pressed the button ${count += 1} time(s)!` });
        });
        break;
      }
      case 'ephemeral': {
        const input = interaction.options.get('input')?.value?.toString();
        await interaction.reply({ content: input, ephemeral: true });
        break;
      }
      case 'select': {
        const row = new MessageActionRow()
          .addComponents(
            new MessageSelectMenu()
              .setCustomId('select')
              .setPlaceholder('Nothing selected')
              .addOptions([
                {
                  label: 'Select me',
                  description: 'This is a description',
                  value: 'first_option',
                },
                {
                  label: 'You can select me too',
                  description: 'This is also a description',
                  value: 'second_option',
                },
              ]),
          );
        await interaction.reply({ content: 'This is a selection menu!', components: [row] });
        const filter = (i:MessageComponentInteraction) => i.customId === 'select';
        const collector = interaction.channel?.createMessageComponentCollector({
          filter, time: 15000,
        });
        collector?.on('collect', async (i:SelectMenuInteraction) => {
          await i.update({ content: `You selected: "${i.values[0]}"` });
        });
        break;
      }
    }
  }
}
