const { Command } = require('discord.js-commando');

const axios = require('../../config/axios');

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
        duration: 10,
      },
      args: [
        {
          key: 'option',
          prompt: 'Do you want to `add`, `edit`, `delete`, `load`, or `destroy` info?',
          type: 'string',
          oneOf: ['add', 'edit', 'delete', 'load', 'destroy'],
        },
        {
          key: 'key',
          prompt: 'What is the key of the info you want to edit?',
          type: 'string',
          default: '',
          validate: (text) => { if (text.length <= 32) return true; },
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
      if (!arg.value) return message.say('No key specified!');
      if (!arg.value) return message.say('No text specified!');
      const stmt = client.db.prepare(`INSERT INTO info (guild, key, value) VALUES (${guild}, lower('${arg.key}'), '${arg.value}')`);
      client.db.transaction(() => {
        try {
          stmt.run();
          message.react('✅');
        } catch (err) {
          if (err.message === 'Entry already exists!') message.say(err.message);
          else message.react('❌');
        }
      })();
    }

    function edit() {
      if (!arg.value) return message.say('No key specified!');
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
      if (!arg.value) return message.say('No key specified!');
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

    async function load() {
      const attachment = message.attachments.find((file) => file.name.endsWith('json'));
      if (!attachment) return message.say('No JSON provided!');
      const json = await axios.get(attachment.url, { ignoreCache: true });
      const stmt = client.db.prepare(`INSERT INTO info (guild, key, value) VALUES (${guild}, @key, @value)`);
      json.data.forEach((entry) => {
        if (!entry?.key || !entry?.value || typeof entry.key === 'number' || typeof entry.value === 'number') return;
        client.db.transaction(() => {
          try {
            stmt.run(entry);
            message.react('✅');
          } catch (err) {
            message.say(`Entry ${entry.key} already exists!`);
            message.react('❌');
          }
        })();
      });
    }

    function destroy() {
      const stmt = client.db.prepare(`DELETE FROM info WHERE guild = '${guild}'`);
      client.db.transaction(() => {
        try {
          stmt.run();
          message.react('✅');
        } catch (err) {
          message.react('❌');
        }
      })();
    }

    switch (arg.option) {
      case 'add':
        add();
        break;
      case 'edit':
        edit();
        break;
      case 'delete':
        del();
        break;
      case 'load':
        load();
        break;
      case 'destroy':
        destroy();
        break;
    }
  }
};
