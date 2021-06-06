const { Command } = require('discord.js-commando');

module.exports = class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      aliases: ['i'],
      group: 'school',
      memberName: 'info',
      description: 'Lookup info about a topic',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 5,
      },
      args: [
        {
          key: 'key',
          prompt: 'What is the key of the info you are looking for?',
          type: 'string',
        },
      ],
    });
  }

  run(message, arg) {
    const { client } = this;
    const stmt = client.db.prepare(`SELECT * FROM info WHERE key = lower('${arg.key}')`);

    client.db.transaction(() => {
      try {
        const info = stmt.get();
        if (info) {
          message.say(info.value);
        } else message.react('❌');
      } catch (err) {
        message.react('❌');
      }
    })();
  }
};
