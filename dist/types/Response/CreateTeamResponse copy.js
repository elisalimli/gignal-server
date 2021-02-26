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
exports.CreateTeamResponse = void 0;
const type_graphql_1 = require("type-graphql");
const FieldError_1 = require("../Error/FieldError");
const Team_1 = require("../../entities/Team");
let CreateTeamResponse = class CreateTeamResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CreateTeamResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => Team_1.Team, { nullable: true }),
    __metadata("design:type", Team_1.Team)
], CreateTeamResponse.prototype, "team", void 0);
CreateTeamResponse = __decorate([
    type_graphql_1.ObjectType()
], CreateTeamResponse);
exports.CreateTeamResponse = CreateTeamResponse;
//# sourceMappingURL=CreateTeamResponse%20copy.js.map