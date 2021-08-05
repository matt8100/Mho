import { Args, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { AxiosResponse } from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import TurndownService from 'turndown';

import axios from '../../config/axios.js';

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
    const courseCode = await args.pick('string').catch(() => message.reply('You must specify a course code!'));
    const baseUrl = 'https://engineering.calendar.utoronto.ca';
    const h1Url = `${baseUrl}/course/${courseCode}h1`;
    const y1Url = `${baseUrl}/course/${courseCode}y1`;

    // Get final redirect URL from response headers
    function getResponseUrl(response: AxiosResponse): string {
      const { link } = response.headers;
      return link.substring(link.indexOf('<') + 1, link.indexOf('>'));
    }

    // Retrieves field text
    function getRelated($: CheerioAPI, fieldName: string): string {
      if (!($(`.field--name-field-${fieldName}`).length)) return '';

      const turndownService = new TurndownService();
      turndownService.addRule('addBaseUrl', {
        filter(node, options) {
          return (
            options.linkStyle === 'inlined'
         && node.nodeName === 'A'
         && node.getAttribute('href')
          );
        },
        replacement(content, node) {
          const href = node.getAttribute('href');
          return `[${content}](${baseUrl}/${href})`;
        },
      });

      const html = $(`.field--name-field-${fieldName}`).children('.field__item').html();
      return turndownService.turndown(html);
    }

    function constructEmbed(response: AxiosResponse): MessageEmbed {
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

    // courses are either h1 or y1
    let response = await axios.get(h1Url);
    if (getResponseUrl(response) !== h1Url) response = await axios.get(y1Url);
    if (getResponseUrl(response) !== y1Url) message.react('❌');
    else {
      const embed = constructEmbed(response);
      message.channel.send({ embeds: [embed] });
    }
  }
}
