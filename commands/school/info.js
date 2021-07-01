const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      aliases: ['i'],
      group: 'school',
      memberName: 'info',
      description: 'Lookup info about a topic. Use `info list` for a list of topics',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
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
    const guild = message.guild.id;

    function constructEmbed(value) {
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setDescription(value);
      return embed;
    }

    function list() {
      const stmt = client.db.prepare(`SELECT key FROM INFO WHERE guild = '${guild}'`);
      client.db.transaction(() => {
        try {
          const keys = stmt.all(); // Retrieves array of single-element JSONs
          for (let i = 0; i < keys.length; i += 1) keys[i] = keys[i].key;
          message.say(keys.sort().join(', '));
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    function get() {
      const stmt = client.db.prepare(`SELECT * FROM info WHERE guild = '${guild}' AND key = lower('${arg.key}')`);
      client.db.transaction(() => {
        try {
          const info = stmt.get();
          if (info) message.embed(constructEmbed(info.value));
          else message.react('❌');
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    if (arg.key === 'list') list(); // List all keys
    else get(); // Standard run
  }
};
