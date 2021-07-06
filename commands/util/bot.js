const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { DateTime, Duration } = require('luxon');

module.exports = class Bot extends Command {
  constructor(client) {
    super(client, {
      name: 'bot',
      group: 'util',
      memberName: 'bot',
      description: 'Bot information. Options are `info`, `issue`, `donate`.',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'option',
          prompt: '`donate`, `info`, `issue`',
          type: 'string',
          oneOf: ['donate', 'info', 'issue'],
        },
      ],
    });
  }

  run(message, arg) {
    const { client } = this;

    function donate() {
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle('Buy me a coffee! ☕')
        .setURL('https://ko-fi.com/matt8100')
        .setDescription('If you\'d like, you can support my development by buying my creator a coffee!')
        .setThumbnail('https://github.com/matt8100/Mho/blob/main/assets/avatar.png?raw=true');

      return embed;
    }

    function info() {
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle('Mho')
        .setDescription('You can find the [source code on GitHub](https://github.com/matt8100/Mho). Got a feature suggestion? Open up an issue and tell me about it!')
        .setThumbnail('https://github.com/matt8100/Mho/blob/main/assets/avatar.png?raw=true')
        .addFields(
          { name: 'Creator:', value: client.owners[0].tag, inline: true },
          { name: 'Created At:', value: DateTime.fromISO('2021-05-19T07:01:20Z').toLocaleString(DateTime.DATETIME_FULL), inline: true },
          { name: 'Last Updated At', value: DateTime.fromMillis(client.readyTimestamp).toLocaleString(DateTime.DATETIME_FULL), inline: true },
          { name: 'Bot Uptime:', value: Duration.fromMillis(client.uptime).toFormat('hh:mm:ss'), inline: true },
          { name: 'Servers Being Served:', value: client.guilds.cache.size, inline: true },
          { name: 'Users Being Served:', value: client.users.cache.size, inline: true },
        );

      return embed;
    }

    function issue() {
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle('Having an issue?')
        .setDescription('You can report issues with the bot on the GitHub [issue tracker](https://github.com/matt8100/Mho/issues). You can also give a go at fixing it yourself if you\'d like!')
        .setThumbnail('https://github.com/matt8100/Mho/blob/staging/avatar.png?raw=true');

      return embed;
    }

    switch (arg.option) {
      case 'donate':
        return message.embed(donate());
      case 'info':
        return message.embed(info());
      case 'issue':
        return message.embed(issue());
    }
  }
};
