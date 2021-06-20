const { Command } = require('discord.js-commando');

module.exports = class Cross extends Command {
  constructor(client) {
    super(client, {
      name: 'cross',
      group: 'misc',
      memberName: 'cross',
      description: 'For setting up cross-server chat.',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'option',
          prompt: 'Set a `channel` or `toggle` cross-server chat',
          type: 'string',
          oneOf: ['channel', 'toggle'],
        },
        {
          key: 'channel',
          prompt: 'Mention the channel or channel ID',
          type: 'channel',
          default: '',
        },
      ],
    });
  }

  run(message, arg) {
    const { settings } = message.guild;
    if (settings.get('cross-server-whitelist') === '0') return message.say('Your server is not whitelisted for cross-server chat!');

    switch (arg.option) {
      case 'channel':
        if (!arg.channel) return message.say('Specify a channel!');
        settings.set('cross-server-channel', arg.channel.id);
        message.react('✅');
        break;
      case 'toggle': {
        const toggleState = 1 - settings.get('cross-server-enabled', 0);
        settings.set('cross-server-enabled', toggleState);
        if (toggleState) message.react('▶');
        else message.react('⏹');
        break;
      }
    }
  }
};
