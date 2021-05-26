const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = class Template extends Command {
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
          key: 'arg',
          prompt: 'What is the course code you are trying to look up?',
          type: 'string',
        },
      ],
    });
  }

  async run(message, { arg }) {
    const courseCode = arg.toLowerCase();
    const baseUrl = 'https://engineering.calendar.utoronto.ca';
    const h1Url = `${baseUrl}/course/${courseCode}h1`;
    const y1Url = `${baseUrl}/course/${courseCode}y1`;

    function getRelated($, fieldName) {
      if (!($(`.field--name-field-${fieldName}`).length)) return false; // if element DNE
      const courseCodes = $(`.field--name-field-${fieldName} > div`).slice(1).map(function courseCodes() { return $(this).text(); }).get()[0];
      const courseLinks = $(`.field--name-field-${fieldName} > div a`).map(function courseLinks() { return $(this).attr('href'); }).get();

      if (isNaN(courseCodes.slice(courseCodes.length - 1))) return courseCodes;

      const splitCodes = courseCodes.split(/[ /]/); // delimit by whitespace and slash
      let courseText = '';
      for (let i = 0; i < splitCodes.length; i += 1) {
        courseText += `[${splitCodes[i]}](${baseUrl + courseLinks[i]})`;
        if (splitCodes[i].slice(splitCodes[i].length - 1) !== ';' && i < splitCodes.length - 1) courseText += '/';
        else courseText += ' ';
      }

      return courseText;
    }

    function constructEmbed(response) {
      const $ = cheerio.load(response.data);

      const courseTitle = $('h1').text();
      const courseUrl = response.request.res.responseUrl;
      const courseDescription = $('p').text();
      const coursePrereqs = getRelated($, 'prerequisite');
      const coursePrep = getRelated($, 'recommended-preparation');
      const courseExclusions = getRelated($, 'exclusion');

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(courseTitle)
        .setURL(courseUrl)
        .setDescription(courseDescription);

      if (coursePrereqs) embed.addField('Prerequisite', coursePrereqs);
      if (coursePrep) embed.addField('Recommended Preparation', coursePrep);
      if (courseExclusions) embed.addField('Exclusions', courseExclusions);
      return embed;
    }

    async function fetchHTML(url) {
      const response = await axios.get(url);
      if (response.request.res.responseUrl !== url) return;
      return constructEmbed(response);
    }

    const embed = await fetchHTML(h1Url) ? await fetchHTML(h1Url) : await fetchHTML(y1Url);
    if (embed) return message.embed(embed);
    return message.say('Course not found!');
  }
};
