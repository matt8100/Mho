const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');

const axios = require('../../config/axios');

module.exports = class Timetable extends Command {
  constructor(client) {
    super(client, {
      name: 'timetable',
      aliases: ['tt'],
      group: 'school',
      memberName: 'timetable',
      description: '',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'session',
          prompt: 'Which session timetable would you like to search?',
          type: 'string',
          oneOf: ['fall', 'winter'],
        },
        {
          key: 'query',
          prompt: 'What are you searching for?',
          type: 'string',
          validate: (text) => text.length < 201,
        },
      ],
    });
  }

  async run(message, arg) {
    const baseUrl = `https://portal.engineering.utoronto.ca/sites/timetable/${arg.session}.html`;

    function constructEmbed(result) {
      const { code, sections } = result.item;
      const embeds = [];

      sections.forEach((section) => {
        const { sectionCode, meetings } = section;
        const { delivery, notes } = section.meetings[0];
        const embed = new MessageEmbed()
          .setColor('#162951')
          .setTitle(`${code} Timetable`)
          .setURL(`${baseUrl}#:~:text=${code}`)
          .setDescription(`[Course Link](https://engineering.calendar.utoronto.ca/course/${code.slice(0, -1)})`)
          .addFields(
            { name: 'Section', value: sectionCode, inline: true },
            { name: 'Delivery', value: delivery || 'N/A', inline: true },
            { name: 'Notes', value: notes || 'N/A', inline: true },
          );

        meetings.forEach((meeting) => {
          const {
            day, start, end, location, professors,
          } = meeting;
          embed.addFields(
            { name: 'Time', value: `${day} ${start} - ${end}`, inline: true },
            { name: 'Location', value: location || 'N/A', inline: true },
            { name: 'Professor(s)', value: professors || 'N/A', inline: true },
          );
        });

        embeds.push(embed);
      });

      return embeds;
    }

    function search(responseData) {
      const $ = cheerio.load(responseData);
      const timeTables = [];

      $('table').slice(1).get()
        .forEach((table) => {
          $(table).find('tr').slice(1).get()
            .forEach((row) => {
              const code = $(row).children('td').first().text();
              const [
                sectionCode, startDate, day, start, end, location, professors, notes, delivery,
              ] = $(row).children('td').slice(1).get()
                .map((td) => $(td).text().trim());

              const newMeeting = {
                startDate, day, start, end, location, professors, notes, delivery,
              };
              const newSection = {
                sectionCode,
                meetings: [],
              };
              const currentCourse = timeTables.find((course) => course.code === code);
              if (currentCourse) {
                const currentSection = currentCourse.sections
                  .find((section) => section.sectionCode === sectionCode);
                if (currentSection) {
                  currentSection.meetings.push(newMeeting);
                } else {
                  newSection.meetings.push(newMeeting);
                  currentCourse.sections.push(newSection);
                }
              } else {
                const newCourse = {
                  code,
                  sections: [],
                };

                newCourse.sections.push(newSection);
                newCourse.sections[0].meetings.push(newMeeting);
                timeTables.push(newCourse);
              }
            });
        });

      // fuzzy search
      const fuse = new Fuse(timeTables, {
        keys: ['code', 'sections.meetings.professors'],
        includeScore: true,
        ignoreLocation: true,
      });
      return fuse.search(arg.query, { limit: 5 });
    }

    const { data } = await axios.get(baseUrl);
    const results = search(data);
    const embeds = results.map((result) => constructEmbed(result));

    if (embeds[0]?.length) {
      const embedMessage = await message.embed(embeds[0][0].setFooter(`Page 1/${embeds.length}  |  Section 1/${embeds[0].length}`));

      const pageTurn = ['⏪', '◀️', '▶️', '⏩'];
      pageTurn.forEach((reaction) => embedMessage.react(reaction));

      let embedPage = 0;
      let sectionPage = 0;
      const reactionCollector = embedMessage.createReactionCollector(
        (reaction, user) => pageTurn.includes(reaction.emoji.name) && user === message.author,
        { time: 60 * 5 * 1000 }, // 5 mins
      );

      reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user);
        if (reaction.emoji.name === '◀️') sectionPage = (sectionPage > 0) ? sectionPage - 1 : sectionPage;
        if (reaction.emoji.name === '▶️') sectionPage = (sectionPage + 1 < embeds[embedPage].length) ? sectionPage + 1 : sectionPage;
        if (reaction.emoji.name === '⏪') { embedPage = (embedPage > 0) ? embedPage - 1 : embedPage; sectionPage = 0; }
        if (reaction.emoji.name === '⏩') { embedPage = (embedPage + 1 < embeds.length) ? embedPage + 1 : embedPage; sectionPage = 0; }

        embedMessage.edit(embeds[embedPage][sectionPage]
          .setFooter(`Page ${embedPage + 1}/${embeds.length}  |  Section ${sectionPage + 1}/${embeds[embedPage].length}`));
      });

      reactionCollector.on('end', () => { if (!embedMessage.deleted) embedMessage.reactions.removeAll(); });
    } else message.react('❌');
  }
};
