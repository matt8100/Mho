const { Command } = require('discord.js-commando');

module.exports = class Template extends Command {
  constructor(client) {
    super(client, {
      name: 'template',
      aliases: ['t', 'temp'],
      group: 'utility',
      memberName: 'template',
      description: 'A command template',
      guildOnly: false,
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_MESSAGES'],
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'text',
          prompt: 'What text would you like the bot to say?',
          type: 'string',
          validate: (text) => text.length < 201,
          oneOf: ['yes', 'no'],
        },
      ],
    });
  }

  run(message) {
    return message.say('This is a template command!');
  }
};

/*
name: name of command
aliases: alternate names
group: command group
memberName: name of command within group (can be different)
description: help text
guildOnly: command only in guilds
clientPermissions: bot permissions required
userPermissions: user permissions required
throttling: command usage rate-limiting
  usages: number of usages in duration
  duration: duration and length of cooldown
args: command arguments
  key: name of arg
  prompt: empty arg prompt text
  type: arg type
*/
