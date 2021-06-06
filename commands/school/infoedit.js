const { Command } = require('discord.js-commando');

module.exports = class InfoEdit extends Command {
  constructor(client) {
    super(client, {
      name: 'infoedit',
      aliases: ['ie'],
      group: 'school',
      memberName: 'infoedit',
      description: 'Editing info for the info command',
      guildOnly: false,
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
          oneOf: ['add', 'a', 'edit', 'e', 'delete', 'del', 'd'],
        },
        {
          key: 'key',
          prompt: 'What is the key of the info you want to edit?',
          type: 'string',
        },
        {
          key: 'value',
          prompt: 'What is the info you want to add/edit? If you are deleting an entry, type the name once more to confirm.',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  run(message, arg) {
    const { client } = this;

    function add() {
      if (!arg.value) return message.reply('No text specified!');
      if (arg.key === 'list') return message.react('❌');
      const stmt = client.db.prepare(`INSERT INTO info (key, value) VALUES (lower('${arg.key}'), '${arg.value}')`);
      client.db.transaction(() => {
        try {
          stmt.run();
          message.react('✅');
        } catch (err) {
          if (err.message === 'UNIQUE constraint failed: info.key') return message.reply('Entry already exists!');
          message.react('❌');
        }
      })();
    }

    function edit() {
      if (!arg.value) return message.reply('No text specified!');
      const stmt = client.db.prepare(`UPDATE info SET value = '${arg.value}' WHERE key = lower('${arg.key}')`);
      client.db.transaction(() => {
        try {
          const info = stmt.run();
          if (info.changes) message.react('✅');
          else message.reply('No such entry!');
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    function del() {
      const stmt = client.db.prepare(`DELETE FROM info WHERE key = lower('${arg.key}')`);
      client.db.transaction(() => {
        try {
          const info = stmt.run();
          if (info.changes) message.react('✅');
          else message.reply('No such entry!');
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
        del();
        return message;
      default:
    }
  }
};
