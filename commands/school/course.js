const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = class Course extends Command {
  constructor(client) {
    super(client, {
      name: 'course',
      aliases: ['c'],
      group: 'school',
      memberName: 'course',
      description: 'Lookup a course by course code',
      guildOnly: false,
      args: [
        {
          key: 'code',
          prompt: 'What is the course code you are trying to look up?',
          type: 'string',
          validate: (text) => { if (text.length < 10) return true; },
        },
      ],
      throttling: {
        usages: 3,
        duration: 5,
      },
    });
  }

  async run(message, arg) {
    const courseCode = arg.code.toLowerCase();
    const baseUrl = 'https://engineering.calendar.utoronto.ca';
    const h1Url = `${baseUrl}/course/${courseCode}h1`;
    const y1Url = `${baseUrl}/course/${courseCode}y1`;

    // Retrieves field text
    function getRelated($, fieldName) {
      if (!($(`.field--name-field-${fieldName}`).length)) return; // if element DNE return
      const courseCodes = $(`.field--name-field-${fieldName} > div`).slice(1).map(function courseCodes() { return $(this).text(); }).get()[0];
      const courseLinks = $(`.field--name-field-${fieldName} > div a`).map(function courseLinks() { return $(this).attr('href'); }).get();
      const splitCodes = courseCodes.split(/[ /]/); // delimit by whitespace and slash

      // If last char of text is not a number, return as string.
      if (isNaN(courseCodes.slice(courseCodes.length - 1))) return courseCodes;

      // Populate return string
      let courseText = '';
      splitCodes.forEach((code, index, array) => {
        courseText += `[${code}](${baseUrl + courseLinks[index]})`;
        courseText += (code.slice(code.length - 1) !== ';' && index < array.length - 1) ? '/' : ' ';
      });

      return courseText;
    }

    function constructEmbed(response) {
      const $ = cheerio.load(response.data);

      const courseTitle = $('h1').text();
      const courseUrl = response.request.res.responseUrl;
      const courseDescription = $('p').text();

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(courseTitle)
        .setURL(courseUrl)
        .setDescription(courseDescription);

      // fields that may or may not be there
      const fields = ['prerequisite', 'corequisite', 'recommended-preparation', 'exclusion'];
      fields.forEach((field) => {
        const fieldName = field.replace('-', ' ').replace(/\w\S*/g, (word) => (word.replace(/^\w/, (char) => char.toUpperCase())));
        const fieldText = getRelated($, field);
        if (fieldText) embed.addField(fieldName, fieldText);
      });

      return embed;
    }

    async function fetchHTML(url) {
      const response = await axios.get(url);
      if (response.request.res.responseUrl !== url) return;
      return response;
    }

    // courses are either h1 or y1
    const response = await fetchHTML(h1Url) ? await fetchHTML(h1Url) : await fetchHTML(y1Url);
    const embed = constructEmbed(response);
    if (embed) return message.embed(embed);
    return message.react('❌');
  }
};
