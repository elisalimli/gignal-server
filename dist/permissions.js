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
exports.directMessageSubscriptionCheck = exports.requiresTeamAccess = exports.requiresAuth = void 0;
const typeorm_1 = require("typeorm");
const Channel_1 = require("./entities/Channel");
const Member_1 = require("./entities/Member");
const Team_1 = require("./entities/Team");
const createResolver = (resolver) => {
    const baseResolver = resolver;
    baseResolver.createResolver = (childResolver) => {
        const newResolver = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
            yield resolver(parent, args, context, info);
            return childResolver(parent, args, context, info);
        });
        return createResolver(newResolver);
    };
    return baseResolver;
};
exports.requiresAuth = createResolver((parent, args, { connection }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_b = (_a = connection.context) === null || _a === void 0 ? void 0 : _a.req) === null || _b === void 0 ? void 0 : _b.session.userId;
    if (!userId)
        throw new Error("Not authenticated");
}));
exports.requiresTeamAccess = createResolver((parent, { channelId }, { connection }) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    console.log("permission starts");
    const userId = (_d = (_c = connection.context) === null || _c === void 0 ? void 0 : _c.req) === null || _d === void 0 ? void 0 : _d.session.userId;
    const channel = (yield Channel_1.Channel.findOne(channelId));
    if (!channel) {
        throw new Error("Channel cannot be founded");
    }
    const member = yield Member_1.Member.findOne({
        where: { teamId: channel === null || channel === void 0 ? void 0 : channel.teamId, userId },
    });
    if (!member) {
        throw new Error("You have to be a member of the team to subcribe to it's messages");
    }
    console.log("permission end");
}));
exports.directMessageSubscriptionCheck = createResolver((parent, { input }, { connection }) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    console.log("permission starts");
    const { teamId, receiverId } = input;
    const userId = (_f = (_e = connection.context) === null || _e === void 0 ? void 0 : _e.req) === null || _f === void 0 ? void 0 : _f.session.userId;
    const team = (yield Team_1.Team.findOne(teamId));
    if (!team) {
        throw new Error("Team cannot be founded");
    }
    const members = yield typeorm_1.getConnection().query(`
      select * from member where "teamId" = $1 and ("userId" = $2 or "userId" = $3)
      `, [teamId, userId, receiverId]);
    if (members.length !== 2) {
        throw new Error("Something went wrong");
    }
    console.log("permisssion end");
}));
//# sourceMappingURL=permissions.js.map