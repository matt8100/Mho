import { Command } from '@sapphire/framework';
import { isMessageInstance } from '@sapphire/discord.js-utilities';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('ping')
        .setDescription('Ping bot to see if it is alive')
        .addBooleanOption((option) =>
          option
            .setName('ephemeral')
            .setDescription('Whether only you can see this')
        ),
      { idHints: ['1067247487091494973'] }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const ephemeral = interaction.options.getBoolean('ephemeral')
    const msg = await interaction.reply({ content: `Ping?`, ephemeral: ephemeral ?? true, fetchReply: true });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓 (Round trip took: ${diff}ms, Heartbeat: ${ping}ms)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}