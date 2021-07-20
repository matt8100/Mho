import { Args, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import Fuse from 'fuse.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

import axios from '../../config/axios.js';

@ApplyOptions({
  name: 'calendar',
  aliases: ['cal'],
  description: 'Search the sessional dates calendar',
  detailedDescription: '',
  cooldownLimit: 2,
  cooldownDelay: 10,
})

export default class extends Command {
  public async run(message: Message, args: Args) {
    const query = await args.pick('string');
    const baseUrl = 'https://engineering.calendar.utoronto.ca/sessional-dates';
    type event = {
      calendar: string,
      date: string,
      event: string
    }

    function search(response: AxiosResponse): Fuse.FuseResult<event>[] {
      const $ = cheerio.load(response.data);
      const tables: event[][] = [];

      $('table').slice(0, 3).prev('h3').get()
        .map((header) => $(header).text())
        .forEach((calendar, index) => {
          const table = $(`table:eq(${index})`).find('tr').get()
            .map((row) => $(row).find('td').get().map((cell) => $(cell).text().trim().replace(/\t+/g, '')))
            .map((x) => ({ calendar, date: x[0], event: x[1] }));
          tables.push(table);
        });

      const fuse = new Fuse(tables.flat(), {
        keys: ['calendar', 'date', 'event'],
        includeScore: true,
        ignoreLocation: true,
      });
      return fuse.search(query, { limit: 5 });
    }

    function constructEmbed(result: Fuse.FuseResult<event>): MessageEmbed {
      const embed = new MessageEmbed()
        .setColor('#162951')
        .setTitle('Sessional Dates')
        .setURL(baseUrl)
        .setDescription(`__${result.item.calendar}__`)
        .addField(result.item.date, result.item.event);

      return embed;
    }

    const response = await axios.get(baseUrl);
    const results = search(response);
    const embeds = results.map((result) => constructEmbed(result));

    const display = new PaginatedMessage({ actions: PaginatedMessage.defaultActions });
    embeds.forEach((embed) => { display.addPageEmbed(embed); });
    display.run(message);
  }
}
