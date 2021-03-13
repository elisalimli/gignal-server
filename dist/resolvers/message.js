"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = void 0;
const fs_1 = require("fs");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const path_1 = __importDefault(require("path"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const Message_1 = require("../entities/Message");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middlewares/isAuth");
const permissions_1 = require("../permissions");
const CreateMessageInput_1 = require("../types/Input/CreateMessageInput");
const pubsub_1 = require("../utils/pubsub");
const CreateMessageResponse_1 = require("../types/Response/CreateMessageResponse");
let MessageResolver = class MessageResolver {
    messages(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getConnection().query(`
      select m.*,
      json_build_object('id',u.id,
      'username',u.username) creator from message
      m join public.user u on u.id = m."creatorId"
      where "channelId" = $1 
      order by "createdAt" ASC
      `, [channelId]);
        });
    }
    createMessage(input, { req }) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let url = null;
            let fileType = null;
            const { text, channelId, file } = input;
            if (file) {
                const { createReadStream, mimetype, filename } = yield file;
                const uploadStream = createReadStream();
                let byteLength = 0;
                try {
                    for (var uploadStream_1 = __asyncValues(uploadStream), uploadStream_1_1; uploadStream_1_1 = yield uploadStream_1.next(), !uploadStream_1_1.done;) {
                        const uploadChunk = uploadStream_1_1.value;
                        byteLength += uploadChunk.byteLength;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (uploadStream_1_1 && !uploadStream_1_1.done && (_a = uploadStream_1.return)) yield _a.call(uploadStream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (byteLength >= constants_1.MAX_FILE_SIZE) {
                    return {
                        errors: [
                            {
                                field: 'size',
                                message: `File size must be less than ${constants_1.MAX_FILE_SIZE / 1000000}MB`
                            }
                        ]
                    };
                }
                fileType = mimetype;
                const splittedFileType = filename.split('.');
                url = `${uuid_1.v4()}.${splittedFileType[splittedFileType.length - 1]}`;
                createReadStream().pipe(fs_1.createWriteStream(path_1.default.join(__dirname, `../../files/${url}`)));
            }
            const message = yield Message_1.Message.create({
                text,
                channelId,
                url: url === null || url === void 0 ? void 0 : url.toString(),
                fileType: fileType === null || fileType === void 0 ? void 0 : fileType.toString(),
                creatorId: req.session.userId,
                createdAt: new Date().toISOString(),
            }).save();
            const asyncFo = () => __awaiter(this, void 0, void 0, function* () {
                const currentUser = yield User_1.User.findOne(message.creatorId);
                pubsub_1.pubsub.publish(constants_1.NEW_CHANNEL_MESSAGE, {
                    newMessageAdded: Object.assign(Object.assign({}, message), { creator: currentUser }),
                });
            });
            asyncFo();
            return {
                message
            };
        });
    }
    newMessageAdded(root, channelId) {
        return root.newMessageAdded;
    }
    url(root) {
        return root.url ? `http://localhost:4000/files/${root.url}` : root.url;
    }
};
__decorate([
    type_graphql_1.Query(() => [Message_1.Message], { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("channelId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "messages", null);
__decorate([
    type_graphql_1.Mutation(() => CreateMessageResponse_1.CreateMessageResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateMessageInput_1.CreateMessageInput, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "createMessage", null);
__decorate([
    type_graphql_1.Subscription(() => Message_1.Message, {
        subscribe: permissions_1.requiresAuth.createResolver(permissions_1.requiresTeamAccess.createResolver(graphql_subscriptions_1.withFilter(() => {
            return pubsub_1.pubsub.asyncIterator(constants_1.NEW_CHANNEL_MESSAGE);
        }, (payload, { channelId }) => __awaiter(void 0, void 0, void 0, function* () {
            const message = payload.newMessageAdded;
            return message.channelId === channelId;
        })))),
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg("channelId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MessageResolver.prototype, "newMessageAdded", null);
__decorate([
    type_graphql_1.FieldResolver(() => String, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Message_1.Message]),
    __metadata("design:returntype", void 0)
], MessageResolver.prototype, "url", null);
MessageResolver = __decorate([
    type_graphql_1.Resolver(Message_1.Message)
], MessageResolver);
exports.MessageResolver = MessageResolver;
//# sourceMappingURL=message.js.map