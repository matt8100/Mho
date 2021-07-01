const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');

const axios = require('../../config/axios');

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

    function constructEmbed(result) {
      const confidence = parseFloat(1 - result.score).toFixed(2) * 100;
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle('Sessional Dates')
        .setURL(baseUrl)
        .setDescription(`__${result.item.calendar}__`)
        .addField(result.item.date, result.item.event)
        .setFooter(`Confidence: ${confidence}%`);

      return embed;
    }

    function search(response) {
      const $ = cheerio.load(response.data);
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
      return fuse.search(arg.search, { limit: 5 });
    }

    const response = await axios.get(baseUrl);
    const results = search(response);
    const embeds = results.map((result) => constructEmbed(result));

    if (embeds[0]) {
      const embedMessage = await message.embed(embeds[0].setFooter(`${embeds[0].footer.text}  |  1/${embeds.length}`));

      const pageTurn = ['◀️', '▶️'];
      pageTurn.forEach((reaction) => embedMessage.react(reaction));

      let page = 0;
      const reactionCollector = embedMessage.createReactionCollector(
        (reaction, user) => pageTurn.includes(reaction.emoji.name) && user === message.author,
        { time: 60 * 5 * 1000 }, // 5 mins
      );

      reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user);
        if (reaction.emoji.name === '◀️') page = (page > 0) ? page - 1 : page;
        if (reaction.emoji.name === '▶️') page = (page + 1 < embeds.length) ? page + 1 : page;

        const confidence = parseFloat(embeds[page].footer.text.substr(12)).toFixed(2);
        embedMessage.edit(embeds[page].setFooter(`Confidence: ${confidence}%  |  ${page + 1}/${embeds.length}`));
      });

      reactionCollector.on('end', () => { if (!embedMessage.deleted) embedMessage.reactions.removeAll(); });
    } else message.react('❌');
  }
};
