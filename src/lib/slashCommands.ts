import { URL } from 'url';
import { readdirSync } from 'fs';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

import MhoClient from './MhoClient.js';
import { ApplicationCommandData } from 'discord.js';

export default async (client: MhoClient): Promise<void> => {
  // slash command loading
  const dirPath = new URL('../slashCommands/', import.meta.url);
  const slashCommandFiles = readdirSync(dirPath).filter((file) => file.endsWith('.js'));
  await Promise.all(slashCommandFiles.map(async (file) => {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const command = await import(new URL(file, dirPath.href).href);
    client.slashCommands.set(command.default.name, command.default);
  }));

  // slash command deployment
  const commands = client.slashCommands
    .map(({ execute, ...data }) => data);
  const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN || '');

  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands('805674424388157450', '285949459316080650'),
        { body: commands },
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();

  // try {
  //   await client.guilds.cache.get('285949459316080650')?.commands.set(commands);
  //   client.logger.info('Reloaded application (/) commands.');
  // } catch (error) {
  //   client.logger.error(error);
  // }

  // slash command handling
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!client.slashCommands.has(interaction.commandName)) return;

    try {
      await client.slashCommands.get(interaction.commandName)?.execute(interaction);
    } catch (error) {
      client.logger.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });
};
