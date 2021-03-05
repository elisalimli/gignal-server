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
exports.DirectMessageResolver = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const DirectMessage_1 = require("../entities/DirectMessage");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middlewares/isAuth");
const permissions_1 = require("../permissions");
const CreateDirectMessageInput_1 = require("../types/Input/CreateDirectMessageInput");
const DirectMessagesInput_1 = require("../types/Input/DirectMessagesInput");
const DirectMessageSubscriptionInput_1 = require("../types/Input/DirectMessageSubscriptionInput");
const pubsub_1 = require("../utils/pubsub");
let DirectMessageResolver = class DirectMessageResolver {
    directMessages({ teamId, otherUserId }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getConnection().query(`
       select dm.*,json_build_object('id',u.id,'username',u.username) creator from direct_message dm 
       join public.user u on u.id = dm."senderId" where 
       (dm."receiverId" = $2 and dm."senderId" = $3 
       or dm."receiverId" = $3 and dm."senderId" = $2)
       and dm."teamId" = $1
       order by dm."createdAt" ASC
        `, [teamId, otherUserId, req.session.userId]);
        });
    }
    createDirectMessage(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.session;
            if (input.receiverId === userId)
                return false;
            const message = yield DirectMessage_1.DirectMessage.create(Object.assign(Object.assign({}, input), { senderId: userId, createdAt: new Date().toISOString() })).save();
            const asyncFo = () => __awaiter(this, void 0, void 0, function* () {
                const { username, id } = (yield User_1.User.findOne(message.senderId));
                pubsub_1.pubsub.publish(constants_1.NEW_DIRECT_MESSAGE, {
                    newDirectMessageAdded: Object.assign(Object.assign({}, message), { creator: {
                            id,
                            username,
                        } }),
                });
            });
            asyncFo();
            return true;
        });
    }
    newDirectMessageAdded(root, _) {
        return root.newDirectMessageAdded;
    }
};
__decorate([
    type_graphql_1.Query(() => [DirectMessage_1.DirectMessage]),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DirectMessagesInput_1.DirectMessagesInput, Object]),
    __metadata("design:returntype", Promise)
], DirectMessageResolver.prototype, "directMessages", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDirectMessageInput_1.CreateDirectMessageInput, Object]),
    __metadata("design:returntype", Promise)
], DirectMessageResolver.prototype, "createDirectMessage", null);
__decorate([
    type_graphql_1.Subscription(() => DirectMessage_1.DirectMessage, {
        subscribe: permissions_1.requiresAuth.createResolver(permissions_1.directMessageSubscriptionCheck.createResolver(graphql_subscriptions_1.withFilter(() => pubsub_1.pubsub.asyncIterator(constants_1.NEW_DIRECT_MESSAGE), (payload, variables, context) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const userId = (_b = (_a = context.connection.context) === null || _a === void 0 ? void 0 : _a.req) === null || _b === void 0 ? void 0 : _b.session.userId;
            return (variables.input.teamId === payload.newDirectMessageAdded.teamId &&
                (payload.newDirectMessageAdded.senderId === userId ||
                    payload.newDirectMessageAdded.receiverId === userId));
        })))),
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg("input", () => DirectMessageSubscriptionInput_1.DirectMessageSubscriptionInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, DirectMessageSubscriptionInput_1.DirectMessageSubscriptionInput]),
    __metadata("design:returntype", void 0)
], DirectMessageResolver.prototype, "newDirectMessageAdded", null);
DirectMessageResolver = __decorate([
    type_graphql_1.Resolver(DirectMessage_1.DirectMessage)
], DirectMessageResolver);
exports.DirectMessageResolver = DirectMessageResolver;
//# sourceMappingURL=directMessage.js.map