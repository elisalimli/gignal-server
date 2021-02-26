import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Channel } from "../entities/Channel";
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { ChannelInput } from "../types/Input/ChannelInput";
import { CreateChannelInput } from "../types/Input/CreateChannelInput";
import { MyContext } from "../types/MyContext";
import { CreateChannelResponse } from "../types/Response/CreateChannelResponse";

@Resolver(Channel)
export class ChannelResolver {
  @Query(() => Channel, { nullable: true })
  @UseMiddleware(isAuth)
  async channel(@Arg("input") input: ChannelInput): Promise<Channel | null> {
    const { channelId: id, teamId } = input;
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

    const team = (
      await getConnection().query(
        `
  select "creatorId" from team where id = $1
  `,
        [input.teamId]
      )
    )[0];
    if (team?.creatorId !== req.session.userId) {
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

    console.log(!!errors);
    if (errors.length > 0) return { errors };

    const { name, teamId, isPublic } = input;
    try {
      const channel = await Channel.create({
        creatorId: req.session.userId,
        name,
        public: isPublic,
        teamId,
      }).save();
      console.log("channel");
      return {
        channel,
      };
    } catch (err) {
      console.log("err", err);
      return {
        errors: [{ field: "general", message: "An error occured" }],
      };
    }
  }
}
