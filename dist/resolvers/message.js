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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Message_1 = require("../entities/Message");
const isAuth_1 = require("../middlewares/isAuth");
const CreateMessageInput_1 = require("../types/Input/CreateMessageInput");
const User_1 = require("../entities/User");
const NEW_CHANNEL_MESSAGE = "NEW_CHANNEL_MESSAGE";
const pubsub = new graphql_subscriptions_1.PubSub();
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
        return __awaiter(this, void 0, void 0, function* () {
            const { text, channelId } = input;
            const message = yield Message_1.Message.create({
                text,
                channelId,
                creatorId: req.session.userId,
            }).save();
            const asyncFo = () => __awaiter(this, void 0, void 0, function* () {
                const currentUser = yield User_1.User.findOne(message.creatorId);
                pubsub.publish(NEW_CHANNEL_MESSAGE, {
                    channelId,
                    newMessageAdded: Object.assign(Object.assign({}, message), { creator: currentUser }),
                });
            });
            asyncFo();
            return message;
        });
    }
    newMessageAdded(root, channelId) {
        console.log("sub", root);
        return root.newMessageAdded;
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
    type_graphql_1.Mutation(() => Message_1.Message),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateMessageInput_1.CreateMessageInput, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "createMessage", null);
__decorate([
    type_graphql_1.Subscription(() => Message_1.Message, {
        subscribe: graphql_subscriptions_1.withFilter((_, __, { connection }) => {
            var _a, _b, _c, _d, _e;
            console.log("!connection.context?.req?.session", !((_b = (_a = connection.context) === null || _a === void 0 ? void 0 : _a.req) === null || _b === void 0 ? void 0 : _b.session));
            if (!((_e = (_d = (_c = connection.context) === null || _c === void 0 ? void 0 : _c.req) === null || _d === void 0 ? void 0 : _d.session) === null || _e === void 0 ? void 0 : _e.userId))
                throw new Error("not auth");
            return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE);
        }, (payload, variables, _) => {
            return variables.channelId === payload.channelId;
        }),
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg("channelId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MessageResolver.prototype, "newMessageAdded", null);
MessageResolver = __decorate([
    type_graphql_1.Resolver(Message_1.Message)
], MessageResolver);
exports.MessageResolver = MessageResolver;
//# sourceMappingURL=message.js.map