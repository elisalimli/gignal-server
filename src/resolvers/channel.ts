import { PCMember } from "src/types/PrivateChannelMember";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { getConnection, getManager } from 'typeorm';
import { Channel } from "../entities/Channel";
import { PrivateChannelMember } from '../entities/PrivateChannelMember';
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { ChannelInput } from "../types/Input/ChannelInput";
import { CreateChannelInput } from "../types/Input/CreateChannelInput";
import { MyContext } from '../types/MyContext';
import { CreateChannelResponse } from "../types/Response/CreateChannelResponse";


@Resolver(Channel)
export class ChannelResolver {
  @Query(() => Channel, { nullable: true })
  @UseMiddleware(isAuth)
  async channel(@Arg("input") input: ChannelInput): Promise<Channel | null> {
    const { channelId: id, teamId } = input;
    const channel = await Channel.findOne({ where: { id, teamId } });
    console.log('channel')
    console.log('channel', channel)
    console.log('channel', channel)
    console.log('channel', channel)
    console.log('channel')
    if (!channel) return null;

    return channel;
  }

  @Mutation(() => CreateChannelResponse)
  @UseMiddleware(isAuth)
  async createChannel(
    @Arg("input") input: CreateChannelInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateChannelResponse | null> {
    const errors: FieldError[] = [];
    const { userId } = req.session;

    const team = (
      await getConnection().query(
        `
        select admin from team where id = $1
        `,
        [userId]
      )
    )[0]

    if (!team.admin) {
      return {
        errors: [{ field: "name", message: "You aren't owner of team" }],
      };
    }

    if (input.name.length <= 2) {
      errors.push({
        field: "name",
        message: "Channel name must be greater than 2",
      });
    }

    if (errors.length > 0) return { errors };

    const { name, teamId, isPublic, members } = input;

    try {
      const res = await getManager().transaction(async () => {
        const channel = await Channel.create({
          creatorId: userId,
          name,
          public: isPublic,
          teamId,
        }).save();

        const newMembers: PCMember[] = [];
        if (!isPublic) {
          const filteredMembers = members.filter(uid => uid !== userId)
          filteredMembers.push(userId)
          filteredMembers.forEach(uid => {
            const admin = req.session.userId === uid ? true : false;
            console.log("admin", admin)
            newMembers.push({ userId: uid, channelId: channel.id, admin })
          });
          await getConnection()
            .createQueryBuilder()
            .insert()
            .into(PrivateChannelMember)
            .values(newMembers)
            .execute();
        }
        return { channel }
      })

      return res;
    } catch (err) {
      console.log("err", err);
      return {
        errors: [{ field: "general", message: "An error occured" }],
      };
    }
  }
}
