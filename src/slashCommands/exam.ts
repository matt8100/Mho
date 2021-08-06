import { CommandInteraction, MessageEmbed } from 'discord.js';
import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';

import axios from '../config/axios.js';

export default {
  name: 'exam',
  description: 'Lookup final exam times on the exam schedule by course code',
  options: [{
    name: 'course_code',
    type: 'STRING',
    description: 'The course code you are looking up',
    required: true,
  }],
  async execute(interaction: CommandInteraction): Promise<void> {
    const courseCode = interaction.options.getString('course_code')?.toUpperCase();
    const baseUrl = 'https://engineering.calendar.utoronto.ca/course/';
    const scheduleUrl = 'https://portal.engineering.utoronto.ca/sites/timetable/fes.aspx';

    function constructEmbed(response: AxiosResponse) {
      const $ = cheerio.load(response.data);

      const courseTitle = $(`strong:contains(${courseCode})`).text().replace(/\n\s+/g, '');
      const courseUrl = baseUrl + courseTitle;
      const pageTitle = $('#lblTitle').text().replace(/\s+/g, ' ');
      const examDate = $(`strong:contains(${courseCode})`).parent().text().split('Date: ')
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
    if (embed.url !== baseUrl) interaction.reply({ embeds: [embed] });
    else interaction.reply({ content: 'No such course found!', ephemeral: true });
  },
};
