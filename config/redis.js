const redis = require('redis');

const client = redis.createClient({ retry_strategy: () => {} });

client.on('error', () => {
  console.error('Failed to connect to Redis.');
});

module.exports = client;
