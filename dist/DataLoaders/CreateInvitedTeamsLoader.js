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
exports.createInvitedTeamsLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Team_1 = require("../entities/Team");
const Member_1 = require("../entities/Member");
const createInvitedTeamsLoader = () => new dataloader_1.default((userId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberTeams = yield Member_1.Member.find({
        where: { userId },
    });
    const teams = [];
    memberTeams.forEach((team) => __awaiter(void 0, void 0, void 0, function* () {
        const newTeam = yield Team_1.Team.findOne(team.teamId);
        teams.push(newTeam);
    }));
    return teams;
}));
exports.createInvitedTeamsLoader = createInvitedTeamsLoader;
//# sourceMappingURL=CreateInvitedTeamsLoader.js.map