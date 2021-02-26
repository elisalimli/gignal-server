import DataLoader from "dataloader";
import { Team } from "../entities/Team";
import { Member } from "../entities/Member";

export const createInvitedTeamsLoader = () =>
  new DataLoader<number, Team[]>(async (userId) => {
    const memberTeams = await Member.find({
      where: { userId },
    });
    // console.log("membered", memberTeams);
    const teams: Team[] = [];
    // console.log("here ---------------------");
    memberTeams.forEach(async (team) => {
      const newTeam = await Team.findOne(team.teamId);
      // console.log("new team", newTeam);
      // console.log("before", teams);
      teams.push(newTeam);
      // console.log("after", teams);
    });
    // console.log("here ---------------------");
    // console.log("teammmmms", teams);
    return teams;
  });
