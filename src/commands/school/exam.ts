import { Args, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';

import axios from '../../config/axios.js';

@ApplyOptions({
  name: 'exam',
  aliases: ['e'],
  description: 'Lookup final exam times on the exam schedule by course code',
  detailedDescription: '',
  cooldownLimit: 2,
  cooldownDelay: 10,
})

export default class extends Command {
  public async run(message: Message, args: Args): Promise<void> {
    const courseCode = await args.pick('string').then((string) => string.toUpperCase()).catch(() => message.reply('You must specify a course code!'));
    const baseUrl = 'https://engineering.calendar.utoronto.ca/course/';
    const scheduleUrl = 'https://portal.engineering.utoronto.ca/sites/timetable/fes.aspx';

    function constructEmbed(response: AxiosResponse) {
      const $ = cheerio.load(response.data);

      const courseTitle = $(`strong:contains(${courseCode})`).text().replace(/\n\s+/g, '');
      const courseUrl = baseUrl + courseTitle;
      const pageTitle = $('#lblTitle').text().replace(/\s+/g, ' ');
      const examDate = $(`strong:contains(${courseCode})`).parent().text()
        .split('Date: ')
        .pop()
        ?.split('Time:')
        .shift()
        ?.trim();
      const examTime = $(`strong:contains(${courseCode})`).parent().text()
        .split('Date: ')
        .pop()
        ?.split('Time:')
        .pop()
        ?.trim();

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
      if (examTime) embed.fields[2].value = examTime;

      const columns = ['Location', 'Students', 'Message'];
      $(`strong:contains(${courseCode})`)
        .parent()
        .next('table')
        .find('tr')
        .get()
        .slice(1)
        .map((row) => $(row).find('td').get().map((cell) => $(cell).text().trim()))
        .forEach((row) => row.forEach((value, index) => {
          if (value) embed.addField(columns[index], value, true);
          else embed.addField('\u200B', '\u200B', true);
        }));

      return embed;
    }

    const response = await axios.get(scheduleUrl, { cache: { maxAge: 60 * 60 * 1000 } }); // 1 hr
    const embed = constructEmbed(response);
    if (embed.url !== baseUrl) message.channel.send({ embeds: [embed] });
    else message.react('❌');
  }
}
