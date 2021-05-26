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
					key: 'courseCode',
					prompt: 'What is the course code you are trying to look up?',
					type: 'string',
				},
			],
		});
	}

	async run(message, { courseCode }) {
    const baseUrl = "https://engineering.calendar.utoronto.ca";
    const h1Url = `${baseUrl}/course/${courseCode}h1`;
    const y1Url = `${baseUrl}/course/${courseCode}y1`;

    function constructEmbed(response) {
      const $ = cheerio.load(response.data);
      const courseTitle = $('h1').text();
      const courseDescription = $('p').text();

      const prereqCodes = $('.field--name-field-prerequisite > div a').map(function() { return $(this).text()}).get();
      const prereqLinks = $('.field--name-field-prerequisite > div a').map(function() { return $(this).attr('href'); }).get();
      let coursePrereqs = "";
      for (let i = 0; i < prereqCodes.length; i++) {
        coursePrereqs += `[${prereqCodes[i]}](${baseUrl + prereqLinks[i]})`
        if (i < prereqCodes.length - 1) coursePrereqs += "/";
      }

      const prepCodes = $('.field--name-field-recommended-preparation > div a').map(function() { return $(this).text()}).get();
      const prepLinks = $('.field--name-field-recommended-preparation > div a').map(function() { return $(this).attr('href'); }).get();
      let coursePrep = "";
      for (let i = 0; i < prepCodes.length; i++) {
        coursePrep += `[${prepCodes[i]}](${baseUrl + prepLinks[i]})`
        if (i < prepCodes.length - 1) coursePrep += "/";
      }
      
      const responseUrl = response.request.res.responseUrl;

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(courseTitle)
        .setURL(responseUrl)
        .setDescription(courseDescription)
        .addFields(
          { name: 'Prerequisite', value: coursePrereqs },
          { name: 'Recommended Preparation', value: coursePrep },
        )

        return embed;
    }

    async function fetchHTML(url) {
      const response = await axios.get(url)
      if (response.request.res.responseUrl != url) return;
      return constructEmbed(response);
    }

    const embed = await fetchHTML(h1Url) ? await fetchHTML(h1Url) : await fetchHTML(y1Url);
    if (embed)
      return message.embed(embed);
    else
      return message.say("Course not found!");
	}
};