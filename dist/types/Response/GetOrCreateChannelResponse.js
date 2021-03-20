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
exports.GetOrCreateChannelResponse = void 0;
const type_graphql_1 = require("type-graphql");
const FieldError_1 = require("../Error/FieldError");
let DMChannel = class DMChannel {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], DMChannel.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], DMChannel.prototype, "name", void 0);
DMChannel = __decorate([
    type_graphql_1.ObjectType()
], DMChannel);
let GetOrCreateChannelResponse = class GetOrCreateChannelResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], GetOrCreateChannelResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => DMChannel, { nullable: true }),
    __metadata("design:type", DMChannel)
], GetOrCreateChannelResponse.prototype, "channel", void 0);
GetOrCreateChannelResponse = __decorate([
    type_graphql_1.ObjectType()
], GetOrCreateChannelResponse);
exports.GetOrCreateChannelResponse = GetOrCreateChannelResponse;
//# sourceMappingURL=GetOrCreateChannelResponse.js.map