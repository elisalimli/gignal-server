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

export const requiresTeamAccess = createResolver(
  async (parent: any, { channelId }: any, { connection }: MyContext) => {
    const userId = connection.context?.req?.session.userId;

    if (!userId) throw new Error("Not authenticated");

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

    console.log("channel", channel);
    // if (!user || !user.id) {
    //   throw new Error("Not authenticated");
    // }
    // // check if part of the team
    // const channel = await models.Channel.findOne({ where: { id: channelId } });
    // const member = await models.Member.findOne({
    //   where: { teamId: channel.teamId, userId: user.id },
    // });
  }
);
