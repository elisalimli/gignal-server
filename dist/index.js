"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const ioredis_1 = __importDefault(require("ioredis"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const Channel_1 = require("./entities/Channel");
const Member_1 = require("./entities/Member");
const Message_1 = require("./entities/Message");
const Team_1 = require("./entities/Team");
const User_1 = require("./entities/User");
const channel_1 = require("./resolvers/channel");
const member_1 = require("./resolvers/member");
const message_1 = require("./resolvers/message");
const team_1 = require("./resolvers/team");
const user_1 = require("./resolvers/user");
const CreateMessageCreatorLoader_1 = require("./DataLoaders/CreateMessageCreatorLoader");
const DirectMessage_1 = require("./entities/DirectMessage");
const directMessage_1 = require("./resolvers/directMessage");
const PORT = process.env.PORT || 4000;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const isTestMode = !!process.env.TEST_DB;
    yield typeorm_1.createConnection({
        type: "postgres",
        database: process.env.TEST_DB || "gignal",
        username: "postgres",
        password: "postgres",
        logging: !isTestMode,
        synchronize: !isTestMode,
        entities: [User_1.User, Message_1.Message, Team_1.Team, Channel_1.Channel, Member_1.Member, DirectMessage_1.DirectMessage],
    });
    const app = express_1.default();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use(cors_1.default({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    const sessionMiddleware = express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 366 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.isProduction,
        },
        secret: "hello world",
        resave: false,
        saveUninitialized: false,
    });
    app.use(sessionMiddleware);
    const schema = yield type_graphql_1.buildSchema({
        resolvers: [
            user_1.UserResolver,
            message_1.MessageResolver,
            team_1.TeamResolver,
            channel_1.ChannelResolver,
            member_1.MemberResolver,
            directMessage_1.DirectMessageResolver,
        ],
        validate: false,
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context: ({ req, res, connection }) => ({
            req,
            res,
            redis,
            connection,
            createMessageCreatorLoader: CreateMessageCreatorLoader_1.createMessageCreatorLoader(),
        }),
        subscriptions: {
            path: "/subscriptions",
            onConnect: (_, { upgradeReq }) => __awaiter(void 0, void 0, void 0, function* () {
                return new Promise((res) => sessionMiddleware(upgradeReq, {}, () => {
                    res({ req: upgradeReq });
                }));
            }),
        },
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    const httpServer = http_1.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(PORT, () => {
        console.log(`server listening on port ${PORT}`);
        console.log(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map