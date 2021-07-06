const { setup, RedisStore } = require('axios-cache-adapter');
const redisClient = require('./redis');

const store = new RedisStore(redisClient);
const api = setup({
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hr cache
    clearOnStale: false,
    readOnError: true,
    exclude: {
      query: false,
    },
    store,
  },
});

module.exports = api;
