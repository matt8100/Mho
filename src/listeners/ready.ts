import { ListenerOptions, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ListenerOptions>({ once: true })

export default class extends Listener {
  public async run(): Promise<void> {
    const { client, logger } = this.container;
    client.user?.setActivity('commands', { type: 'LISTENING' });
    logger.info(`Logged in as ${client.user?.tag}! (${client.user?.id})`);
  }
}
