const { setup, RedisStore } = require('axios-cache-adapter');
const redisClient = require('./redis');

const store = new RedisStore(redisClient);
const api = setup({
  cache: {
    maxAge: 60 * 60 * 1000, // 1 hr cache
    store,
  },
});

module.exports = api;
