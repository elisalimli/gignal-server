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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_upload_1 = require("graphql-upload");
require("reflect-metadata");
const constants_1 = require("./constants");
const indexImports_1 = require("./indexImports");
const PORT = process.env.PORT || 4000;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const isTestMode = !!process.env.TEST_DB;
    yield indexImports_1.createConnection({
        type: "postgres",
        database: process.env.TEST_DB || "gignal",
        username: "postgres",
        password: "postgres",
        logging: !isTestMode,
        synchronize: !isTestMode,
        entities: [indexImports_1.User, indexImports_1.Message, indexImports_1.Team, indexImports_1.Channel, indexImports_1.Member, indexImports_1.DirectMessage],
    });
    const app = indexImports_1.express();
    const RedisStore = indexImports_1.connectRedis(indexImports_1.session);
    const redis = new indexImports_1.Redis();
    app.use(indexImports_1.cors({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use("/graphql", graphql_upload_1.graphqlUploadExpress({ maxFileSize: constants_1.MAX_FILE_SIZE, maxFiles: 10 }));
    app.use('/files', indexImports_1.express.static('files'));
    const sessionMiddleware = indexImports_1.session({
        name: indexImports_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 366 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: indexImports_1.isProduction,
        },
        secret: "hello world",
        resave: false,
        saveUninitialized: false,
    });
    app.use(sessionMiddleware);
    const schema = yield indexImports_1.buildSchema({
        resolvers: [
            indexImports_1.UserResolver,
            indexImports_1.MessageResolver,
            indexImports_1.TeamResolver,
            indexImports_1.ChannelResolver,
            indexImports_1.MemberResolver,
            indexImports_1.DirectMessageResolver,
        ],
        validate: false,
    });
    const apolloServer = new indexImports_1.ApolloServer({
        schema,
        context: ({ req, res, connection }) => ({
            req,
            res,
            redis,
            connection,
        }),
        uploads: false,
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
    const httpServer = indexImports_1.createServer(app);
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