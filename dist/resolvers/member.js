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
exports.MemberResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Member_1 = require("../entities/Member");
const Team_1 = require("../entities/Team");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middlewares/isAuth");
const VoidResponse_1 = require("../types/Response/VoidResponse");
const AddTeamMemberInput_1 = require("../types/Input/AddTeamMemberInput");
let MemberResolver = class MemberResolver {
    addTeamMember(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            const { email, teamId } = input;
            const userId = req.session.userId;
            const teamPromise = yield Team_1.Team.findOne({ where: { id: teamId } });
            const userToAddPromise = yield User_1.User.findOne({ where: { email } });
            const [team, userToAdd] = yield Promise.all([
                teamPromise,
                userToAddPromise,
            ]);
            if ((team === null || team === void 0 ? void 0 : team.creatorId) !== userId) {
                errors.push({ field: "email", message: "You aren't owner of the team" });
            }
            if (!userToAdd) {
                errors.push({
                    field: "email",
                    message: "Could not find user with this email",
                });
            }
            const isAlreadyMember = yield Member_1.Member.findOne({
                where: { teamId, userId: userToAdd === null || userToAdd === void 0 ? void 0 : userToAdd.id },
            });
            if (isAlreadyMember) {
                errors.push({
                    field: "email",
                    message: "This member already in the team",
                });
            }
            if (errors.length > 0)
                return {
                    ok: false,
                    errors,
                };
            try {
                yield Member_1.Member.create({ userId: userToAdd === null || userToAdd === void 0 ? void 0 : userToAdd.id, teamId }).save();
                return { ok: true };
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
    type_graphql_1.Mutation(() => VoidResponse_1.VoidResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AddTeamMemberInput_1.AddTeamMemberInput, Object]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "addTeamMember", null);
MemberResolver = __decorate([
    type_graphql_1.Resolver(Member_1.Member)
], MemberResolver);
exports.MemberResolver = MemberResolver;
//# sourceMappingURL=member.js.map