import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import { graphqlUploadExpress } from "graphql-upload";
import path from "path";
import "reflect-metadata";
import { PrivateChannelMember } from "./entities/PrivateChannelMember";
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
import { DirectMessage } from "./entities/DirectMessage";
import { Member } from "./entities/Member";
import { Message } from "./entities/Message";
import { Team } from "./entities/Team";
import { User } from "./entities/User";
import { ChannelResolver } from "./resolvers/channel";
import { DirectMessageResolver } from "./resolvers/directMessage";
import { MemberResolver } from "./resolvers/member";
import { MessageResolver } from "./resolvers/message";
import { TeamResolver } from "./resolvers/team";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types/MyContext";
import { redisOptions } from "./utils/pubsub";

const PORT = process.env.PORT || 8080;

const main = async () => {
  const isTestMode = !!process.env.TEST_DB;
  await createConnection({
    type: "postgres",
    database: process.env.TEST_DB || "gignal",
    username: "postgres",
    password: "postgres",
    logging: !isTestMode,
    synchronize: !isTestMode,

    entities: [
      User,
      Message,
      Team,
      Channel,
      Member,
      DirectMessage,
      PrivateChannelMember,
    ],
  });

  const app = express();
  const RedisStore = connectRedis(session);
  ///asdasdasdasdasopiuhdg
  app.set("trust proxy", 1);
  app.use(
    cors({
      // origin: "https://gignal-frontend.herokuapp.com",
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  dotenv.config();

  const gc = new Storage({
    keyFilename: path.join(
      __dirname,
      "../gignal-92ee9-firebase-adminsdk-wlxgo-17f4e5879d.jsongignal-92ee9-firebase-adminsdk-wlxgo-17f4e5879d.json"
    ),
    projectId: "gignal-92ee9",
  });
  const gignalBucket = gc.bucket("gignal-92ee9.appspot.com");

  app.use("/graphql", graphqlUploadExpress({ maxFiles: 10 }));

  // app.use('/files', express.static('files'))

  const redis = new Redis(redisOptions);

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
      DirectMessageResolver,
    ],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,

    context: ({ req, res, connection }: MyContext) => ({
      req,
      res,
      redis,
      connection,
      bucket: gignalBucket,
    }),
    uploads: false,

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
