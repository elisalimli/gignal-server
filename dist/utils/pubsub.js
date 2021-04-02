"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubsub = exports.redisOptions = void 0;
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisOptions = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: 6379,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    },
};
exports.pubsub = new graphql_redis_subscriptions_1.RedisPubSub({
    publisher: new ioredis_1.default(exports.redisOptions),
    subscriber: new ioredis_1.default(exports.redisOptions),
});
//# sourceMappingURL=pubsub.js.map