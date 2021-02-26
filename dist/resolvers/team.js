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
exports.TeamResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Channel_1 = require("../entities/Channel");
const Team_1 = require("../entities/Team");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middlewares/isAuth");
const CreateTeamResponse_1 = require("../types/Response/CreateTeamResponse");
let TeamResolver = class TeamResolver {
    teams({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getConnection().query(`
      select id,name from team where "creatorId" = $1 ;
       `, [req.session.userId]);
        });
    }
    invitedTeams({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getConnection().query(`
      select t.id,t.name from member m join team t on t.id = m."teamId" where m."userId" = $1
      `, [req.session.userId]);
        });
    }
    deleteTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Team_1.Team.delete(teamId, {});
            return true;
        });
    }
    admin({ req }, root) {
        return __awaiter(this, void 0, void 0, function* () {
            return req.session.userId === root.creatorId;
        });
    }
    team(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = (yield typeorm_1.getConnection().query(`
       select t.*,
       array_agg(json_build_object('id',c.id,'name',c.name,'teamId',c."teamId")) channels
       from team t 
       left join channel c on c."teamId" = $1 where t.id = $1

       group by t.id
      `, [teamId]))[0];
            console.log("here res buddy", res);
            return res;
        });
    }
    members(root) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getConnection().query(`
    select * from member m  join public.user u on u.id = m."userId" where m."teamId" = $1
    `, [root.id]);
        });
    }
    createTeam(name, { req: { session: { userId }, }, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            const teamPromise = Team_1.Team.findOne({
                where: { name },
            });
            const [team] = yield Promise.all([teamPromise]);
            if (team) {
                errors.push({
                    field: "name",
                    message: "Team's name must be unique",
                });
            }
            if (name.length <= 2) {
                errors.push({
                    field: "name",
                    message: "Team name must be greater than 2",
                });
            }
            if (errors.length > 0)
                return {
                    errors,
                };
            try {
                const res = yield typeorm_1.getManager().transaction(() => __awaiter(this, void 0, void 0, function* () {
                    const newTeam = yield Team_1.Team.create({
                        name,
                        creatorId: userId,
                    }).save();
                    const { id } = yield Channel_1.Channel.create({
                        creatorId: userId,
                        name: "general",
                        teamId: newTeam.id,
                    }).save();
                    return {
                        team: newTeam,
                        channelId: id,
                    };
                }));
                return res;
            }
            catch (err) {
                console.log("error", err);
                if (err.code === 23505) {
                    return {
                        errors: [
                            {
                                field: "name",
                                message: "this name has been taken already",
                            },
                        ],
                    };
                }
                return {
                    errors: [
                        {
                            field: "general",
                            message: "Something went wrong,please try again",
                        },
                    ],
                };
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Team_1.Team], { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "teams", null);
__decorate([
    type_graphql_1.Query(() => [Team_1.Team], { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "invitedTeams", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("teamId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "deleteTeam", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Ctx()), __param(1, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Team_1.Team]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "admin", null);
__decorate([
    type_graphql_1.Query(() => Team_1.Team, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("teamId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "team", null);
__decorate([
    type_graphql_1.FieldResolver(() => [User_1.User], { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Team_1.Team]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "members", null);
__decorate([
    type_graphql_1.Mutation(() => CreateTeamResponse_1.CreateTeamResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("name")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamResolver.prototype, "createTeam", null);
TeamResolver = __decorate([
    type_graphql_1.Resolver(Team_1.Team)
], TeamResolver);
exports.TeamResolver = TeamResolver;
//# sourceMappingURL=team.js.map