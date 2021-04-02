import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

export const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: 6379,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
});
