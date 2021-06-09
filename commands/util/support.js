const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class Support extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      group: 'util',
      memberName: 'support',
      description: 'Support the bot developer',
      throttling: {
        usages: 2,
        duration: 60,
      },
    });
  }

  run(message) {
    const embed = new MessageEmbed()
      .setColor('#162951')
      .setTitle('Buy me a coffee! ☕')
      .setURL('https://ko-fi.com/matt8100')
      .setDescription('If you\'d like, you can support my development by buying my creator a coffee!');
    return message.embed(embed);
  }
};
