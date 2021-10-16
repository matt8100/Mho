import {
  CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu,
} from 'discord.js';
import { AxiosResponse } from 'axios';
import cheerio from 'cheerio';

import axios from '../config/axios.js';

export default {
  name: 'timetable',
  description: 'Lookup a course\'s timetable by course code',
  options: [{
    name: 'session',
    type: 3,
    description: 'The session you are searching',
    required: true,
    choices: [{ name: 'fall', value: 'fall' }, { name: 'winter', value: 'winter' }],
  },
  {
    name: 'course_code',
    type: 3,
    description: 'The course code you are looking up',
    required: true,
  }],
  async execute(interaction: CommandInteraction): Promise<void> {
    const session = interaction.options.getString('session');
    const courseCode = interaction.options.getString('course_code')?.toUpperCase();
    const baseUrl = `https://portal.engineering.utoronto.ca/sites/timetable/${session}.html`;

    interface Meeting {
      startDate: string,
      day: string,
      start: string,
      end: string,
      location: string,
      professors: string,
      notes: string,
      delivery: string,
    }
    interface Section {
      sectionCode: string,
      meetings: Meeting[],
    }
    interface Course {
      code: string,
      sections: Section[],
      }

    function constructEmbeds(course: Course): MessageEmbed[] {
      const embeds: MessageEmbed[] = [];

      course.sections.forEach((section) => {
        const { sectionCode, meetings } = section;
        const { delivery, notes } = section.meetings[0];
        const embed = new MessageEmbed()
          .setColor('#162951')
          .setTitle(`${course.code} Timetable`)
          .setURL(`${baseUrl}#:~:text=${course.code}`)
          .setDescription(`[Course Link](https://engineering.calendar.utoronto.ca/course/${course.code.slice(0, -1)})`)
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

    function search(response: AxiosResponse) {
      const $ = cheerio.load(response.data as never);

      const course: Course = { code: '', sections: [] };
      $('table').slice(1).find('tr').slice(1)
        .filter(function filter() {
          return $(this).find('td').first().text()
            .includes(courseCode || '');
        })
        .closest('tr')
        .each((_, row) => {
          const [
            code, sectionCode, startDate, day, start, end, location, professors, notes, delivery,
          ] = $(row).children('td').get()
            .map((td) => $(td).text().trim());

          course.code = code;
          const newMeeting: Meeting = {
            startDate, day, start, end, location, professors, notes, delivery,
          };
          const currentSection = course.sections
            .find((section) => section.sectionCode === sectionCode);
          if (currentSection) currentSection.meetings.push(newMeeting);
          else {
            const newSection: Section = {
              sectionCode,
              meetings: [],
            };
            const index = course.sections.push(newSection);
            course.sections[index - 1].meetings.push(newMeeting);
          }
        });
      return course;
    }

    const response = await axios.get(baseUrl);
    const result = search(response);

    if (result.code === '') {
      interaction.reply({ content: 'No such course found!', ephemeral: true });
      return;
    }
    const embeds = constructEmbeds(result);

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select')
          .setPlaceholder('Select a section')
          .addOptions(result.sections.map((section) => ({ label: section.sectionCode, description: '', value: section.sectionCode }))),
      );

    const message = await interaction
      .reply({ embeds: [embeds[0]], components: [row], fetchReply: true }) as Message;

    const collector = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, componentType: 'SELECT_MENU', time: 1800 * 1000 });

    collector.on('collect', (i) => {
      const embed = embeds.find((e) => e.fields[0].value === i.values[0]) || embeds[0];
      i.update({ embeds: [embed] });
    });

    collector.on('end', (collected) => {
      const embed = embeds
        .find((e) => e.fields[0].value === collected.last()?.values[0]) || embeds[0];
      if (collected) message.edit({ embeds: [embed], components: [] });
      else interaction.editReply({ embeds: [embeds[0]], components: [] });
    });

    // for building a search list
    // function search(response: AxiosResponse) {
    //   const $ = cheerio.load(response.data);
    //   interface meeting {
    //     startDate: string,
    //     day: string,
    //     start: string,
    //     end: string,
    //     location: string,
    //     professors: string,
    //     notes: string,
    //     delivery: string,
    //   }
    //   interface section {
    //     sectionCode: string,
    //     meetings: meeting[],
    //   }
    //   interface course {
    //     code: string,
    //     sections: section[],
    //     };
    //   const timeTables: course[] = [];

    //   $('table').slice(1).get()
    //     .forEach((table) => {
    //       $(table).find('tr').slice(1).get()
    //         .forEach((row) => {
    //           const code = $(row).children('td').first().text();
    //           const [
    //             sectionCode, startDate, day, start, end, location, professors, notes, delivery,
    //           ] = $(row).children('td').slice(1).get()
    //             .map((td) => $(td).text().trim());

    //           const newMeeting: meeting = {
    //             startDate, day, start, end, location, professors, notes, delivery,
    //           };
    //           const newSection: section = {
    //             sectionCode,
    //             meetings: [],
    //           };
    //           const currentCourse = timeTables.find((course) => course.code === code);
    //           if (currentCourse) {
    //             const currentSection = currentCourse.sections
    //               .find((section) => section.sectionCode === sectionCode);
    //             if (currentSection) {
    //               currentSection.meetings.push(newMeeting);
    //             } else {
    //               newSection.meetings.push(newMeeting);
    //               currentCourse.sections.push(newSection);
    //             }
    //           } else {
    //             const newCourse: course = {
    //               code,
    //               sections: [],
    //             };

    //             newCourse.sections.push(newSection);
    //             newCourse.sections[0].meetings.push(newMeeting);
    //             timeTables.push(newCourse);
    //           }
    //         });
    //     });
    // }
  },
};
