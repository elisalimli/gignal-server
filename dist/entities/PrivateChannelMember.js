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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateChannelMember = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Team_1 = require("./Team");
const User_1 = require("./User");
let PrivateChannelMember = class PrivateChannelMember extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], PrivateChannelMember.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], PrivateChannelMember.prototype, "userId", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], PrivateChannelMember.prototype, "channelId", void 0);
__decorate([
    type_graphql_1.Field(() => Team_1.Team),
    typeorm_1.ManyToOne(() => Team_1.Team, (team) => team.privateChannelMembers, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Team_1.Team)
], PrivateChannelMember.prototype, "team", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User),
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.privateChannelMembers, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], PrivateChannelMember.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], PrivateChannelMember.prototype, "isYou", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    typeorm_1.Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], PrivateChannelMember.prototype, "admin", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], PrivateChannelMember.prototype, "updatedAt", void 0);
PrivateChannelMember = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], PrivateChannelMember);
exports.PrivateChannelMember = PrivateChannelMember;
//# sourceMappingURL=PrivateChannelMember.js.map