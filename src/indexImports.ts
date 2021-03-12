import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { createConnection, getConnection } from "typeorm";
import { COOKIE_NAME, isProduction } from "./constants";
import { Channel } from "./entities/Channel";
import { Member } from "./entities/Member";
import { Message } from "./entities/Message";
import { Team } from "./entities/Team";
import { User } from "./entities/User";
import { ChannelResolver } from "./resolvers/channel";
import { MemberResolver } from "./resolvers/member";
import { MessageResolver } from "./resolvers/message";
import { TeamResolver } from "./resolvers/team";
import { UserResolver } from "./resolvers/user";
import { createMessageCreatorLoader } from "./DataLoaders/CreateMessageCreatorLoader";
import { DirectMessage } from "./entities/DirectMessage";
import { DirectMessageResolver } from "./resolvers/directMessage";
import {} from "graphql-upload";

export {
  connectRedis,
  cors,
  ApolloServer,
  express,
  session,
  PubSub,
  createServer,
  Redis,
  buildSchema,
  createConnection,
  getConnection,
  COOKIE_NAME,
  isProduction,
  Channel,
  Member,
  Message,
  User,
  Team,
  ChannelResolver,
  MemberResolver,
  TeamResolver,
  MessageResolver,
  UserResolver,
  DirectMessage,
  DirectMessageResolver,
  createMessageCreatorLoader,
};
