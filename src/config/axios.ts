import adapter from 'axios-cache-adapter';
import redisClient from './redis.js';

const { setup, RedisStore } = adapter;

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

export default api;
