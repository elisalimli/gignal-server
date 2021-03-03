import { MyContext } from "./types/MyContext";
import { Channel } from "./entities/Channel";
import { Member } from "./entities/Member";

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
    console.log("request", connection.context?.req?.session);
    if (!userId) throw new Error("Not authenticated");
  }
);

export const requiresTeamAccess = createResolver(
  async (parent: any, { channelId }: any, { connection }: MyContext) => {
    console.log("permission start");
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
