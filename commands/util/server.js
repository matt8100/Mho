const { Command } = require('discord.js-commando');

module.exports = class Server extends Command {
  constructor(client) {
    super(client, {
      name: 'server',
      group: 'util',
      memberName: 'server',
      description: 'Server settings options',
      guildOnly: false,
      ownerOnly: true,
      args: [
        {
          key: 'option',
          prompt: 'https://discord.js.org/#/docs/commando/master/class/SyncSQLiteProvider',
          type: 'string',
          oneOf: ['clear', 'get', 'remove', 'set'],
        },
        {
          key: 'guild',
          prompt: 'Guild the setting is associated with',
          type: 'string',
        },
        {
          key: 'key',
          prompt: 'Name of the setting',
          type: 'string',
          default: '',
        },
        {
          key: 'value',
          prompt: 'Value of the setting',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  // https://discord.js.org/#/docs/commando/master/class/SyncSQLiteProvider
  async run(message, arg) {
    const { provider } = this.client;
    const guild = (arg.guild === 'this') ? message.guild.id : arg.guild;

    switch (arg.option) {
      case 'clear':
        provider.clear(guild);
        message.react('✅');
        break;
      case 'get': {
        if (!arg.key) return message.say('Specify key!');
        const value = await provider.get(guild, arg.key);
        if (!value) message.react('❌');
        else message.say(`${arg.key}: ${value}`);
        break;
      }
      case 'remove': {
        if (!arg.key) return message.say('Specify key!');
        const oldValue = await provider.remove(guild, arg.key);
        if (!oldValue) message.react('❌');
        else message.react('✅');
        break;
      }
      case 'set': {
        if (!arg.key || !arg.value) return message.say('Specify key/value!');
        const value = (arg.value === 'toggle') ? 1 - provider.get(guild, arg.key, 0) : arg.value;
        provider.set(guild, arg.key, value);
        message.react('✅');
        break;
      }
    }
  }
};
