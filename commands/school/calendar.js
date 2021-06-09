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
      // Retrieve calendar table in JSON syntax with keys "date" and "event"
      const table = $('table').slice(0, 3).find('tr').get()
        .map((row) => $(row).find('td').get().map((cell) => $(cell).text().trim().replace(/\t+/g, '')))
        .map((x) => ({ date: x[0], event: x[1] }));
      const fuse = new Fuse(table, { keys: ['date', 'event'] });
      const result = fuse.search(arg.search, { limit: 1 });
      console.log(result);
      if (!result.length) return;

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(title)
        .setURL(baseUrl)
        .addField(result[0].item.date, result[0].item.event);

      return embed;
    }

    async function fetchHTML(url) {
      const response = await axios.get(url);
      return response;
    }

    const response = await fetchHTML(baseUrl);
    const embed = constructEmbed(response);
    if (embed) return message.embed(embed);
    message.react('❌');
  }
};
