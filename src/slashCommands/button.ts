import {
  CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction,
} from 'discord.js';

const command = {
  name: 'test',
  description: 'This makes a button!',
  options: [{
    name: 'input',
    type: 'STRING',
    description: 'You can put something for the button to say!',
    required: false,
  }],
  async execute(interaction: CommandInteraction): Promise<void> {
    const input = interaction.options.get('input')?.value?.toString();
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('primary')
          .setLabel(input || 'Primary')
          .setStyle('PRIMARY'),
      );
    await interaction.reply({ content: 'This is a button!', components: [row] });
    const filter = (i: MessageComponentInteraction) => i.customId === 'primary';
    const collector = interaction.channel?.createMessageComponentCollector({
      filter, time: 15000,
    });
    let count = 0;
    collector?.on('collect', async (i: MessageComponentInteraction) => {
      await i.update({ content: `You pressed the button ${count += 1} time(s)!` });
    });
  },
};

export default command;
