module.exports = {
  name: 'ready',
  once: 'true',

  execute(client) {
    client.user.setActivity('&help', { type: 'LISTENING' });
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  },
};
