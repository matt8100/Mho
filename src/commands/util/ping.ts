import { Command, PieceContext } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'ping',
      description: 'Send back the ping of the bot',
    });
  }

  async run(message: Message) {
    const msg = await message.channel.send('Ping?');
    return msg.edit(
      `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`,
    );
  }
}
