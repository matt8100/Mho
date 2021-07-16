import { Args, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';

@ApplyOptions({
  name: 'course',
  aliases: ['c'],
  description: 'Lookup a course by course code.',
  detailedDescription: '',
  cooldownLimit: 2,
  cooldownDelay: 10,
})

export default class extends Command {
  public async run(message: Message, args: Args) {
    const courseCode = await args.pick('string');
    const baseUrl = 'https://engineering.calendar.utoronto.ca';
    const h1Url = `${baseUrl}/course/${courseCode}h1`;
    const y1Url = `${baseUrl}/course/${courseCode}y1`;

    // Get final redirect URL from response headers
    function getResponseUrl(response: AxiosResponse) {
      const { link } = response.headers;
      return link.substring(link.indexOf('<') + 1, link.indexOf('>'));
    }

    // Retrieves field text
    function getRelated($: CheerioAPI, fieldName: string): string {
      if (!($(`.field--name-field-${fieldName}`).length)) return ''; // if element DNE return
      const courseCodes = $(`.field--name-field-${fieldName} > div`).slice(1).map(function courseCodes() { return $(this).text(); }).get()[0];
      const courseLinks = $(`.field--name-field-${fieldName} > div a`).map(function courseLinks() { return $(this).attr('href'); }).get();
      const splitCodes = courseCodes.split(/[ /,]/).filter((code) => code && code.length > 2); // delimit by whitespace, slash, and comma; filter out empty and short strings

      // If last char of text is not a number, return as string.
      if ((courseCodes.slice(courseCodes.length - 1).match(/\d/))) return courseCodes;

      // Populate return string
      let courseText = '';
      splitCodes.forEach((code, index, array) => {
        courseText += `[${code}](${baseUrl + courseLinks[index]})`;
        courseText += (code.slice(code.length - 1) !== ';' && index < array.length - 1) ? '/' : ' ';
      });

      return courseText;
    }

    function constructEmbed(response: AxiosResponse) {
      const $ = cheerio.load(response.data);

      const courseTitle = $('h1').text();
      const courseUrl = getResponseUrl(response);
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

    async function fetchHTML(url: string): Promise<AxiosResponse<any>> {
      const response = await axios.get(url);
      if (getResponseUrl(response) !== url) return Promise.reject();
      return response;
    }

    // courses are either h1 or y1
    const response = await fetchHTML(h1Url) || await fetchHTML(y1Url);
    if (response) message.channel.send({ embeds: [constructEmbed(response)] });
    else message.react('❌');
  }
}
