import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions({
  name: 'ping',
  description: 'Send back the ping of the bot',
})

export default class extends Command {
  public async messageRun(message: Message): Promise<Message> {
    const msg = await message.channel.send('Ping?');
    return msg.edit(`Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`);
  }
}
