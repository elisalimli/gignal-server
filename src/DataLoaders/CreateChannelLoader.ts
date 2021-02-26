import DataLoader from "dataloader";
import { getConnection } from "typeorm";
import { Channel } from "../entities/Channel";

export const createChannelLoader = () =>
  new DataLoader<number, Channel[]>(async (teamIds) => {
    // const channels = await Channel.findByIds(teamId as number[]);
    const channels = await getConnection()
      .createQueryBuilder(Channel, "c")
      .where("c.teamId IN (:...teamIds)", { teamIds })
      .getMany();
    console.log("i am here channels", channels);

    const channelIdToChannel: Record<number, Channel[]> = {};
    // eslint-disable-next-line no-return-assign
    channels.forEach((c) => (channelIdToChannel[c.teamId] = []));
    channels.forEach((c) => channelIdToChannel[c.teamId].push(c));
    console.log("channels to id", channelIdToChannel);
    return teamIds.map((teamId) => channelIdToChannel[teamId]);

    // const updootIdsToUpdoot: Record<string, Updoot> = {};
    // updoots.forEach((updoot) => {
    //   updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
    // });
    // return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
  });
