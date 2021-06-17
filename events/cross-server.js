const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'message',
  once: false,

  execute(message) {
    if (message.channel.type === 'text'
        && message.guild.settings.get('cross-server-whitelist')
        && message.channel.id === message.guild.settings.get('cross-server-channel')
        && !message.author.bot) {
      const embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(message.cleanContent)
        .setFooter(`From: ${message.guild.name}`, message.guild.iconURL());

      message.client.guilds.cache.filter((guild) => (guild.settings.get('cross-server-whitelist') && message.guild.id !== guild.id)).forEach((guild) => {
        const channelId = guild.settings.get('cross-server-channel');
        const crossChannel = guild.channels.cache.get(channelId);
        crossChannel.send(embed);
      });
    }
  },
};
