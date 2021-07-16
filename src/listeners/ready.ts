import { Listener, PieceContext } from '@sapphire/framework';

export default class extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
    });
  }

  async run() {
    const { client, logger } = this.container;
    client.user!.setActivity('commands', { type: 'LISTENING' });
    logger.info(`Logged in as ${client.user!.tag}! (${client.user!.id})`);
  }
}
