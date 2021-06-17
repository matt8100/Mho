const { Command } = require('discord.js-commando');

module.exports = class InfoEdit extends Command {
  constructor(client) {
    super(client, {
      name: 'infoedit',
      aliases: ['ie'],
      group: 'school',
      memberName: 'infoedit',
      description: 'Editing info for the info command',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      throttling: {
        usages: 2,
        duration: 5,
      },
      args: [
        {
          key: 'option',
          prompt: 'Do you want to `add`, `edit`, or `delete` info?',
          type: 'string',
          oneOf: ['add', 'a', 'edit', 'e', 'delete', 'del', 'd', 'rm'],
        },
        {
          key: 'key',
          prompt: 'What is the key of the info you want to edit?',
          type: 'string',
          validate: (text) => { if (text.length <= 20) return true; },
        },
        {
          key: 'value',
          prompt: 'What is the info you want to add/edit? If you are deleting an entry, type the name once more to confirm.',
          type: 'string',
          default: '',
          validate: (text) => { if (text.length <= 1000) return true; },
        },
      ],
    });
  }

  run(message, arg) {
    const { client } = this;
    const guild = message.guild.id;

    function add() {
      if (!arg.value) return message.say('No text specified!');
      if (arg.key === 'list') return message.react('❌');
      const stmt = client.db.prepare(`INSERT INTO info (guild, key, value) VALUES (${guild}, lower('${arg.key}'), '${arg.value}')`);
      client.db.transaction(() => {
        try {
          stmt.run();
          message.react('✅');
        } catch (err) {
          console.log(err.message);
          if (err.message === 'Entry already exists!') return message.say(err.message);
          message.react('❌');
        }
      })();
    }

    function edit() {
      if (!arg.value) return message.say('No text specified!');
      const stmt = client.db.prepare(`UPDATE info SET value = '${arg.value}' WHERE guild = '${guild}' AND key = lower('${arg.key}')`);
      client.db.transaction(() => {
        try {
          const info = stmt.run();
          if (info.changes) message.react('✅');
          else message.say('No such entry!');
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    function del() {
      const stmt = client.db.prepare(`DELETE FROM info WHERE guild = '${guild}' AND key = lower('${arg.key}')`);
      client.db.transaction(() => {
        try {
          const info = stmt.run();
          if (info.changes) message.react('✅');
          else message.say('No such entry!');
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    switch (arg.option) {
      case 'add':
      case 'a':
        add();
        return message;
      case 'edit':
      case 'e':
        edit();
        return message;
      case 'delete':
      case 'del':
      case 'd':
      case 'rm':
        del();
        return message;
      default:
    }
  }
};
