import redis from 'redis';
import { container } from '@sapphire/framework';

const client = redis.createClient({ host: 'mho_redis', port: 6379, retry_strategy: () => undefined });

client.on('connect', () => {
  container.logger.info('Connected to Redis DB');
});

client.on('error', () => {
  container.logger.warn('Failed to connect to Redis DB');
});

export default client;
