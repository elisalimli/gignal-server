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
exports.Channel = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Message_1 = require("./Message");
const User_1 = require("./User");
const Team_1 = require("./Team");
let Channel = class Channel extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Channel.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    typeorm_1.Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Channel.prototype, "public", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    typeorm_1.Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Channel.prototype, "dm", void 0);
__decorate([
    type_graphql_1.Field(() => [User_1.User], { nullable: true }),
    typeorm_1.OneToMany(() => User_1.User, (user) => user.channels),
    __metadata("design:type", Array)
], Channel.prototype, "users", void 0);
__decorate([
    type_graphql_1.Field(() => [Message_1.Message], { nullable: true }),
    typeorm_1.OneToMany(() => Message_1.Message, (message) => message.channel),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
__decorate([
    type_graphql_1.Field(() => Team_1.Team),
    typeorm_1.OneToMany(() => Team_1.Team, (team) => team.channels, { onDelete: "CASCADE" }),
    __metadata("design:type", Team_1.Team)
], Channel.prototype, "team", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User),
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.teams),
    __metadata("design:type", User_1.User)
], Channel.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Channel.prototype, "creatorId", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Channel.prototype, "teamId", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Channel.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Channel.prototype, "updatedAt", void 0);
Channel = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=Channel.js.map