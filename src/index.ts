/* eslint-disable no-new */
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
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
import { MyContext } from "./types/MyContext";
import { createMessageCreatorLoader } from "./DataLoaders/CreateMessageCreatorLoader";

const PORT = process.env.PORT || 4000;

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "gignal",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User, Message, Team, Channel, Member],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // app.set("trust proxy", 1);
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const sessionMiddleware = session({
    name: COOKIE_NAME,
    store: new RedisStore({
      client: redis as any,
      disableTouch: true,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 366 * 10, //10 years
      httpOnly: true,
      sameSite: "lax", //csrf
      secure: isProduction, // cookie only works in https
    },
    secret: "hello world",
    resave: false,
    saveUninitialized: false,
  });
  app.use(sessionMiddleware);

  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      MessageResolver,
      TeamResolver,
      ChannelResolver,
      MemberResolver,
    ],
    validate: false,
  });

  const pubsub = new PubSub();
  const apolloServer = new ApolloServer({
    schema,

    context: ({ req, res, connection }: MyContext) => ({
      req,
      res,
      redis,
      pubsub,
      connection,
      createMessageCreatorLoader: createMessageCreatorLoader(),
    }),
    subscriptions: {
      path: "/subscriptions",
      onConnect: async (_, { upgradeReq }: any) =>
        new Promise((res) =>
          sessionMiddleware(upgradeReq, {} as any, () => {
            res({ req: upgradeReq });
          })
        ),
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  const httpServer = createServer(app);

  apolloServer.installSubscriptionHandlers(httpServer);
  //a
  httpServer.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    console.log(
      `Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
    );
  });
};
main().catch((err) => {
  console.log(err);
});
