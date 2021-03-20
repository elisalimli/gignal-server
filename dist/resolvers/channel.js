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
exports.ChannelResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Channel_1 = require("../entities/Channel");
const Member_1 = require("../entities/Member");
const PrivateChannelMember_1 = require("../entities/PrivateChannelMember");
const isAuth_1 = require("../middlewares/isAuth");
const ChannelInput_1 = require("../types/Input/ChannelInput");
const CreateChannelInput_1 = require("../types/Input/CreateChannelInput");
const GetOrCreateChannelInput_1 = require("../types/Input/GetOrCreateChannelInput");
const CreateChannelResponse_1 = require("../types/Response/CreateChannelResponse");
const GetOrCreateChannelResponse_1 = require("../types/Response/GetOrCreateChannelResponse");
let ChannelResolver = class ChannelResolver {
    channel(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { channelId: id, teamId } = input;
            const channel = yield Channel_1.Channel.findOne({ where: { id, teamId } });
            if (!channel)
                return null;
            return channel;
        });
    }
    createChannel(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            const { userId } = req.session;
            const team = (yield typeorm_1.getConnection().query(`
        select admin from team where id = $1
        `, [userId]))[0];
            if (!team.admin) {
                return {
                    errors: [{ field: "name", message: "You aren't owner of team" }],
                };
            }
            if (input.name.length <= 2) {
                errors.push({
                    field: "name",
                    message: "Channel name must be greater than 2",
                });
            }
            if (errors.length > 0)
                return { errors };
            const { name, teamId, isPublic, members } = input;
            try {
                const res = yield typeorm_1.getManager().transaction(() => __awaiter(this, void 0, void 0, function* () {
                    const channel = yield Channel_1.Channel.create({
                        creatorId: userId,
                        name,
                        public: isPublic,
                        teamId,
                    }).save();
                    const newMembers = [];
                    if (!isPublic) {
                        const filteredMembers = members.filter((uid) => uid !== userId);
                        filteredMembers.push(userId);
                        filteredMembers.forEach((uid) => {
                            const admin = req.session.userId === uid;
                            console.log("admin", admin);
                            newMembers.push({ userId: uid, channelId: channel.id, admin });
                        });
                        yield typeorm_1.getConnection()
                            .createQueryBuilder()
                            .insert()
                            .into(PrivateChannelMember_1.PrivateChannelMember)
                            .values(newMembers)
                            .execute();
                    }
                    return { channel };
                }));
                return res;
            }
            catch (err) {
                console.log("err", err);
                return {
                    errors: [{ field: "general", message: "An error occured" }],
                };
            }
        });
    }
    getOrCreateChannel(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.session;
            const { members, teamId } = input;
            if (!members.length) {
                return {
                    errors: [
                        {
                            field: "members",
                            message: "You have to select members",
                        },
                    ],
                };
            }
            const member = yield Member_1.Member.findOne({ where: { teamId, userId } });
            if (!member) {
                throw new Error("Not Authorized");
            }
            const filteredMembers = members.filter((uid) => uid !== userId);
            const allMembers = [...filteredMembers, userId];
            const [response] = yield typeorm_1.getConnection().query(`
      select c.id,c.name from channel c
      left join private_channel_member pcm on pcm."channelId" = c.id 
     where c.dm = true
     and c."teamId" = $1 and c.public = false     
     group by c.id
     having array_agg(pcm."userId") @> Array[${allMembers.join(",")}]
     and count(pcm."userId") = $2
       `, [teamId, allMembers.length]);
            if (response === null || response === void 0 ? void 0 : response.id) {
                return {
                    channel: {
                        id: response === null || response === void 0 ? void 0 : response.id,
                    },
                    errors: [
                        {
                            field: "members",
                            message: "This direct message channel already created before with same users",
                        },
                    ],
                };
            }
            try {
                const res = yield typeorm_1.getManager().transaction(() => __awaiter(this, void 0, void 0, function* () {
                    const users = yield typeorm_1.getConnection().query(`
          select username from public.user where id in (${allMembers})
          `);
                    let name;
                    if (filteredMembers.length > 1)
                        name = users.map((u) => u.username).join(",");
                    else
                        name = users[0].username;
                    const channel = yield Channel_1.Channel.create({
                        creatorId: userId,
                        name,
                        public: false,
                        dm: true,
                        teamId,
                    }).save();
                    const newMembers = [];
                    allMembers.forEach((uid) => {
                        const admin = userId === uid;
                        console.log("admin", admin);
                        newMembers.push({ userId: uid, channelId: channel.id, admin });
                    });
                    yield typeorm_1.getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(PrivateChannelMember_1.PrivateChannelMember)
                        .values(newMembers)
                        .execute();
                    return {
                        channel: {
                            id: channel.id,
                            name: channel.name,
                        },
                    };
                }));
                return res;
            }
            catch (err) {
                console.log("err", err);
                return {
                    errors: [{ field: "general", message: "An error occured" }],
                };
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => Channel_1.Channel, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChannelInput_1.ChannelInput]),
    __metadata("design:returntype", Promise)
], ChannelResolver.prototype, "channel", null);
__decorate([
    type_graphql_1.Mutation(() => CreateChannelResponse_1.CreateChannelResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateChannelInput_1.CreateChannelInput, Object]),
    __metadata("design:returntype", Promise)
], ChannelResolver.prototype, "createChannel", null);
__decorate([
    type_graphql_1.Mutation(() => GetOrCreateChannelResponse_1.GetOrCreateChannelResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetOrCreateChannelInput_1.GetOrCreateChannelInput, Object]),
    __metadata("design:returntype", Promise)
], ChannelResolver.prototype, "getOrCreateChannel", null);
ChannelResolver = __decorate([
    type_graphql_1.Resolver(Channel_1.Channel)
], ChannelResolver);
exports.ChannelResolver = ChannelResolver;
//# sourceMappingURL=channel.js.map