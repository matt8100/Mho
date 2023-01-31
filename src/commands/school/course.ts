import { Command } from '@sapphire/framework';

import { TTBPayload, TTBResponse, TTBCourseInfo } from '../../models/TTBPayload';

export class CourseCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('course')
        .setDescription('Prints course description')
        .addStringOption((option) =>
          option
            .setName('course_code')
            .setDescription('Course Code to lookup')
            .setMaxLength(10)
            .setRequired(true)
        )
        .addStringOption((option) =>
         option
          .setName('section_code')
          .setDescription('Section to lookup')
          .addChoices(
            { name: 'Fall', value: 'F' },
            { name: 'Winter', value: 'W' },
            { name: 'Full-year', value: 'Y' }
          )
        )
        .addBooleanOption((option) =>
          option
            .setName('ephemeral')
            .setDescription('Whether only you can see this')
        ),
      { idHints: ['1067255253189263381'] }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const courseCode = interaction.options.getString('course_code', true)
    const sectionCode = interaction.options.getString('section_code', false)
    const ephemeral = interaction.options.getBoolean('ephemeral')

    const response = await fetch('https://api.easi.utoronto.ca/ttb/getPageableCourses', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(new TTBPayload(courseCode, sectionCode ?? ''))
    })

    const body = await response.json()

    const info = body.map((body: TTBResponse): TTBCourseInfo => {
      const course = body.payload.pageableCourse.courses[0]
      return {
        code: course.code,
        sectionCode: course.sectionCode,
        name: course.name,
        description: course.cmCourseInfo.description,
        faculty: course.faculty.code,
        prerequisites: course.cmCourseInfo.prerequisitesText,
        recommendedPrep: course.cmCourseInfo.recommendedPreparation,
        corequisites: course.cmCourseInfo.corequisitesText,
        exclusions: course.cmCourseInfo.exclusionsText,
      }
    })

    this.container.logger.info(info);

    return interaction.reply({ content: `${courseCode}?`, ephemeral: ephemeral ?? true, fetchReply: true });

    
  }
}