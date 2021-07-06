const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const axios = require('../../config/axios');

module.exports = class Textbook extends Command {
  constructor(client) {
    super(client, {
      name: 'textbook',
      aliases: ['tb'],
      group: 'school',
      memberName: 'textbook',
      description: 'Search for a textbook by title in the Bookstore',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'option',
          prompt: 'Do you want to search by title or course?',
          type: 'string',
          oneOf: ['title', 'courses'],
        },
        {
          key: 'query',
          prompt: 'What title or course are you searching for?',
          type: 'string',
          validate: (text) => text.length < 101,
        },
      ],
    });
  }

  async run(message, arg) {
    const baseUrl = 'https://nikel.ml/api/textbooks?limit=1';

    function constructEmbed(textbook) {
      const {
        isbn, title, edition, author, image, price, url, courses,
      } = textbook;

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(title)
        .setURL(url)
        .setDescription(`by ${author}`)
        .setThumbnail(image)
        .addFields(
          { name: 'Price', value: price, inline: true },
          { name: 'Edition', value: edition, inline: true },
          { name: 'ISBN', value: isbn, inline: true },
        );

      courses.forEach((course) => {
        embed.addField('Course', course.code, true);
        embed.addField('Requirement', course.requirement, true);
        embed.addField('\u200B', '\u200B', true);
      });

      return embed;
    }

    const { data } = await axios.get(`${baseUrl}&${arg.option}=~${arg.query}`);
    if (data.response[0]) message.embed(constructEmbed(data.response[0]));
    else message.react('❌');
  }
};
