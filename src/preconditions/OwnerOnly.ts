import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

const owners = ['115661304831803393'];

export default class UserPrecondition extends Precondition {
  public async run(message: Message): AsyncPreconditionResult {
    return owners.includes(message.author.id) ? this.ok() : this.error({
      context: { silent: true },
    });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    OwnerOnly: never;
  }
}
