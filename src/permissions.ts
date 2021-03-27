import { getConnection } from "typeorm";
import { Channel } from "./entities/Channel";
import { Member } from "./entities/Member";
import { Team } from "./entities/Team";
import { DirectMessageSubscriptionInput } from "./types/Input/DirectMessageSubscriptionInput";
import { MyContext } from "./types/MyContext";

const createResolver = (resolver: any) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver: any) => {
    const newResolver = async (
      parent: any,
      args: any,
      context: MyContext,
      info: any
    ) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

// requiresAuth

export const requiresAuth = createResolver(
  async (parent: any, args: any, { connection }: MyContext) => {
    const userId = connection.context?.req?.session.userId;
    if (!userId) throw new Error("Not authenticated");
  }
);

export const requiresTeamAccess = createResolver(
  async (parent: any, { channelId }: any, { connection }: MyContext) => {
    console.log("permission starts");
    const userId = connection.context?.req?.session.userId;

    const channel = (await Channel.findOne(channelId)) as Channel;
    if (!channel) {
      throw new Error("Channel cannot be founded");
    }
    const member = await Member.findOne({
      where: { teamId: channel?.teamId, userId },
    });
    if (!member) {
      throw new Error(
        "You have to be a member of the team to subcribe to it's messages"
      );
    }
    console.log("permission end");
  }
);

export const directMessageSubscriptionCheck = createResolver(
  async (parent: any, { input }: any, { connection }: MyContext) => {
    console.log("permission starts");

    const { teamId, receiverId }: DirectMessageSubscriptionInput = input;
    const userId = connection.context?.req?.session.userId;

    const team = (await Team.findOne(teamId)) as Team;
    if (!team) {
      throw new Error("Team cannot be founded");
    }

    const members = await getConnection().query(
      `
      select * from member where "teamId" = $1 and ("userId" = $2 or "userId" = $3)
      `,
      [teamId, userId, receiverId]
    );
    if (members.length !== 2) {
      throw new Error("Something went wrong");
    }
    console.log("permisssion end");
  }
);
