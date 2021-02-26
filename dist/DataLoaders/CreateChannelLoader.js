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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannelLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const Channel_1 = require("../entities/Channel");
const createChannelLoader = () => new dataloader_1.default((teamIds) => __awaiter(void 0, void 0, void 0, function* () {
    const channels = yield typeorm_1.getConnection()
        .createQueryBuilder(Channel_1.Channel, "c")
        .where("c.teamId IN (:...teamIds)", { teamIds })
        .getMany();
    console.log("i am here channels", channels);
    const channelIdToChannel = {};
    channels.forEach((c) => (channelIdToChannel[c.teamId] = []));
    channels.forEach((c) => channelIdToChannel[c.teamId].push(c));
    console.log("channels to id", channelIdToChannel);
    return teamIds.map((teamId) => channelIdToChannel[teamId]);
}));
exports.createChannelLoader = createChannelLoader;
//# sourceMappingURL=CreateChannelLoader.js.map