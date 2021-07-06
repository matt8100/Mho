const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const axios = require('../../config/axios');

module.exports = class Building extends Command {
  constructor(client) {
    super(client, {
      name: 'building',
      aliases: ['b'],
      group: 'school',
      memberName: 'building',
      description: 'Lookup building directions by code or name',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'option',
          prompt: 'Are you searching by code or name?',
          type: 'string',
          oneOf: ['code', 'name'],
        },
        {
          key: 'building',
          prompt: 'What building are you looking for?',
          type: 'string',
          validate: (text) => text.length < 51,
        },
      ],
    });
  }

  async run(message, arg) {
    const baseUrl = 'https://nikel.ml/api/buildings?limit=1';
    const baseDirections = 'https://www.google.com/maps/dir/?api=1';

    function constructEmbed(building) {
      const {
        street, city, province, postal,
      } = building.address;
      const address = `${street},\n${city} ${province}, ${postal}`;
      const directions = `${baseDirections}&destination=${encodeURIComponent(address)}`;

      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle(building.name)
        .setDescription(`[Directions](${directions})`)
        .addFields(
          { name: 'Code', value: building.code, inline: true },
          { name: 'Address', value: address, inline: true },
        );

      return embed;
    }

    const { data } = await axios.get(`${baseUrl}&${arg.option.toLowerCase()}=${arg.building}`);
    if (data.response[0]) message.embed(constructEmbed(data.response[0]));
    else message.react('❌');
  }
};
