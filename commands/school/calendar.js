const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');
const Fuse = require('fuse.js');

module.exports = class Calendar extends Command {
  constructor(client) {
    super(client, {
      name: 'calendar',
      aliases: ['cal', 'sessional'],
      group: 'school',
      memberName: 'calendar',
      description: 'Search for sessional dates',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'search',
          prompt: 'What are you searching for?',
          type: 'string',
          validate: (text) => text.length < 201,
        },
      ],
    });
  }

  async run(message, arg) {
    const baseUrl = 'https://engineering.calendar.utoronto.ca/sessional-dates';

    function constructEmbed(response) {
      const $ = cheerio.load(response.data);
      const title = $('h2').first().text();
      const tables = [];

      $('table')
        .slice(0, 3)
        .prev('h3')
        .get()
        .map((header) => $(header).text())
        .forEach((calendar, index) => {
          const table = $(`table:eq(${index})`)
            .find('tr')
            .get()
            .map((row) => $(row).find('td').get().map((cell) => $(cell).text().trim().replace(/\t+/g, '')))
            .map((x) => ({ calendar, date: x[0], event: x[1] }));
          tables.push(table);
        });

      // fuzzy search
      const fuse = new Fuse(tables.flat(), {
        keys: ['calendar', 'date', 'event'],
        includeScore: true,
        ignoreLocation: true,
      });
      const result = fuse.search(arg.search);
      console.log(result)
      if (!result.length) return;

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(title)
        .setURL(baseUrl)
        .setDescription(`__${result[0].item.calendar}__`)
        .addField(result[0].item.date, result[0].item.event);

      return embed;
    }

    const response = await axios.get(baseUrl);
    const embed = constructEmbed(response);
    if (embed) return message.embed(embed);
    message.react('❌');
  }
};
