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
const PrivateChannelMember_1 = require("../entities/PrivateChannelMember");
const isAuth_1 = require("../middlewares/isAuth");
const ChannelInput_1 = require("../types/Input/ChannelInput");
const CreateChannelInput_1 = require("../types/Input/CreateChannelInput");
const CreateChannelResponse_1 = require("../types/Response/CreateChannelResponse");
let ChannelResolver = class ChannelResolver {
    channel(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { channelId: id, teamId } = input;
            const channel = yield Channel_1.Channel.findOne({ where: { id, teamId } });
            console.log('channel');
            console.log('channel', channel);
            console.log('channel', channel);
            console.log('channel', channel);
            console.log('channel');
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
                        const filteredMembers = members.filter(uid => uid !== userId);
                        filteredMembers.push(userId);
                        filteredMembers.forEach(uid => {
                            const admin = req.session.userId === uid ? true : false;
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
ChannelResolver = __decorate([
    type_graphql_1.Resolver(Channel_1.Channel)
], ChannelResolver);
exports.ChannelResolver = ChannelResolver;
//# sourceMappingURL=channel.js.map