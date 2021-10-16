import { URL } from 'url';
import { readdirSync } from 'fs';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { container } from '@sapphire/framework';

import MhoClient from './MhoClient.js';

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

  if (process.env.NODE_ENV === 'production') {
    (async () => {
      try {
        container.logger.info('Started refreshing global application (/) commands.');

        await rest.put(
          Routes.applicationCommands('805674424388157450'),
          { body: commands },
        );

        container.logger.info('Successfully reloaded global application (/) commands.');
      } catch (error) {
        container.logger.error(error);
      }
    })();
  } else {
    (async () => {
      try {
        container.logger.info('Started refreshing development application (/) commands.');

        await rest.put(
          Routes.applicationGuildCommands('805674424388157450', '285949459316080650'),
          { body: commands },
        );

        container.logger.info('Successfully reloaded development application (/) commands.');
      } catch (error) {
        container.logger.error(error);
      }
    })();
  }

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
