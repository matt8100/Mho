import redis from 'redis';

const client = redis.createClient({ retry_strategy: () => undefined });

client.on('error', () => {
  console.warn('Failed to connect to Redis.');
});

export default client;
