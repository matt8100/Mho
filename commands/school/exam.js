const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = class Template extends Command {
  constructor(client) {
    super(client, {
      name: 'exam',
      aliases: ['e'],
      group: 'school',
      memberName: 'exam',
      description: 'Lookup final exam times on the exam schedule',
      guildOnly: false,
      args: [
        {
          key: 'arg',
          prompt: 'What is the course code you are trying to look up?',
          type: 'string',
          validate: (text) => { if (text.length < 10) return true; },
        },
      ],
      throttling: {
        usages: 2,
        duration: 10,
      },
    });
  }

  async run(message, { arg }) {
    const courseCode = arg.toUpperCase();
    const baseUrl = 'https://engineering.calendar.utoronto.ca/course/';
    const scheduleUrl = 'https://portal.engineering.utoronto.ca/sites/timetable/fes.aspx';

    function constructEmbed(response) {
      const $ = cheerio.load(response.data);

      const courseTitle = $(`strong:contains(${courseCode})`).text().replace(/\n\s+/g, '');
      const courseUrl = baseUrl + courseTitle;
      const pageTitle = $('#lblTitle').text().replace(/\s+/g, ' ');
      const examDate = $(`strong:contains(${courseCode})`).closest('div').text()
        .split('Date: ')
        .pop()
        .split('Time:')
        .shift()
        .trim();
      const examTime = $(`strong:contains(${courseCode})`).closest('div').text()
        .split('Date: ')
        .pop()
        .split('Time:')
        .pop()
        .trim();

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(`${courseTitle} Final Exam`)
        .setURL(courseUrl)
        .setDescription(`[${pageTitle}](${scheduleUrl})`)
        .addFields(
          { name: 'Date: ', value: 'N/A', inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: 'Time: ', value: 'N/A', inline: true },
        );

      if (examDate) embed.fields[0].value = examDate;
      if (examTime) embed.fields[1].value = examTime;

      return embed;
    }

    async function fetchHTML(url) {
      const response = await axios.get(url);
      return constructEmbed(response);
    }

    const embed = await fetchHTML(scheduleUrl);
    if (embed.url === baseUrl) return message.reply('Course not found!');
    return message.embed(embed);
  }
};
