import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_HOST || "127.0.0.1", {
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
});

export const pubsub = new RedisPubSub({
  publisher: redis,
  subscriber: redis,
});
