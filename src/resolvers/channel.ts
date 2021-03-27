import { User } from "src/entities/User";
import { PCMember } from "src/types/PrivateChannelMember";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getManager } from "typeorm";
import { Channel } from "../entities/Channel";
import { Member } from "../entities/Member";
import { PrivateChannelMember } from "../entities/PrivateChannelMember";
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { ChannelInput } from "../types/Input/ChannelInput";
import { CreateChannelInput } from "../types/Input/CreateChannelInput";
import { GetOrCreateChannelInput } from "../types/Input/GetOrCreateChannelInput";
import { MyContext } from "../types/MyContext";
import { CreateChannelResponse } from "../types/Response/CreateChannelResponse";
import { GetOrCreateChannelResponse } from "../types/Response/GetOrCreateChannelResponse";

@Resolver(Channel)
export class ChannelResolver {
  @Query(() => Channel, { nullable: true })
  @UseMiddleware(isAuth)
  async channel(@Arg("input") input: ChannelInput): Promise<Channel | null> {
    const { channelId: id, teamId } = input;

    //channel
    const channel = await Channel.findOne({ where: { id, teamId } });

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
    )[0];

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
          const filteredMembers = members.filter((uid) => uid !== userId);
          filteredMembers.push(userId!);
          filteredMembers.forEach((uid) => {
            const admin = req.session.userId === uid;
            newMembers.push({ userId: uid, channelId: channel.id, admin });
          });
          await getConnection()
            .createQueryBuilder()
            .insert()
            .into(PrivateChannelMember)
            .values(newMembers)
            .execute();
        }
        return { channel };
      });

      return res;
    } catch (err) {
      console.log("err", err);
      return {
        errors: [{ field: "general", message: "An error occured" }],
      };
    }
  }

  @Mutation(() => GetOrCreateChannelResponse)
  @UseMiddleware(isAuth)
  async getOrCreateChannel(
    @Arg("input") input: GetOrCreateChannelInput,
    @Ctx() { req }: MyContext
  ): Promise<GetOrCreateChannelResponse> {
    const { userId } = req.session;
    const { members, teamId } = input;

    if (!members.length) {
      return {
        errors: [
          {
            field: "members",
            message: "You have to select members",
          },
        ],
      };
    }
    //checking the user member of the team
    const member = await Member.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new Error("Not Authorized");
    }

    const filteredMembers = members.filter((uid) => uid !== userId);
    const allMembers = [...filteredMembers, userId!];

    //check if direct message channel already exists with these members
    const [response] = await getConnection().query(
      `
      select c.id,c.name from channel c
      left join private_channel_member pcm on pcm."channelId" = c.id 
     where c.dm = true
     and c."teamId" = $1 and c.public = false     
     group by c.id
     having array_agg(pcm."userId") @> Array[${allMembers.join(",")}]
     and count(pcm."userId") = $2
       `,
      [teamId, allMembers.length]
    );

    if (response?.id) {
      return {
        channel: {
          id: response?.id,
        },
        errors: [
          {
            field: "members",
            message:
              "This direct message channel already created before with same users",
          },
        ],
      };
    }
    try {
      const res = await getManager().transaction(async () => {
        const users = await getConnection().query(
          `
          select username from public.user where id in (${allMembers})
          `
        );

        let name;

        if (filteredMembers.length > 1)
          name = users.map((u: User) => u.username).join(",");
        else name = users[0].username;

        const channel = await Channel.create({
          creatorId: userId,
          name,
          public: false,
          dm: true,
          teamId,
        }).save();

        const newMembers: PCMember[] = [];

        allMembers.forEach((uid) => {
          const admin = userId === uid;
          newMembers.push({ userId: uid, channelId: channel.id, admin });
        });
        await getConnection()
          .createQueryBuilder()
          .insert()
          .into(PrivateChannelMember)
          .values(newMembers)
          .execute();

        return {
          channel: {
            id: channel.id,
            name: channel.name,
          },
        };
      });

      return res;
    } catch (err) {
      console.log("err", err);
      return {
        errors: [{ field: "general", message: "An error occured" }],
      };
    }
  }
}
