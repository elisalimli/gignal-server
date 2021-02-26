/* eslint-disable arrow-body-style */
import { PubSub, withFilter } from "graphql-subscriptions";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Message } from "../entities/Message";
import { isAuth } from "../middlewares/isAuth";
import { CreateMessageInput } from "../types/Input/CreateMessageInput";
import { MyContext } from "../types/MyContext";
import { User } from "../entities/User";

const NEW_CHANNEL_MESSAGE = "NEW_CHANNEL_MESSAGE";
const pubsub = new PubSub();

@Resolver(Message)
export class MessageResolver {
  @Query(() => [Message], { nullable: true })
  @UseMiddleware(isAuth)
  async messages(
    @Arg("channelId", () => Int) channelId: number
  ): Promise<Message[] | null> {
    return getConnection().query(
      `
      select m.*,
      json_build_object('id',u.id,
      'username',u.username) creator from message
      m join public.user u on u.id = m."creatorId"
      where "channelId" = $1 
      order by "createdAt" ASC
      `,
      [channelId]
    );
  }

  @Mutation(() => Message)
  @UseMiddleware(isAuth)
  async createMessage(
    @Arg("input") input: CreateMessageInput,
    @Ctx() { req }: MyContext
  ) {
    const { text, channelId } = input;
    const message = await Message.create({
      text,
      channelId,
      creatorId: req.session.userId,
    }).save();

    const asyncFo = async () => {
      const currentUser = await User.findOne(message.creatorId);
      pubsub.publish(NEW_CHANNEL_MESSAGE, {
        channelId,
        newMessageAdded: {
          ...message,
          creator: currentUser,
        },
      });
    };
    asyncFo();
    return message;
  }

  @Subscription(() => Message, {
    subscribe: withFilter(
      (_, __, { connection }) => {
        console.log(
          "!connection.context?.req?.session",
          !connection.context?.req?.session
        );
        if (!connection.context?.req?.session?.userId)
          throw new Error("not auth");

        return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE);
      },
      (payload: Message, variables: { channelId: number }, _) => {
        return variables.channelId === payload.channelId;
      }
    ),
  })
  newMessageAdded(
    @Root() root: any,
    // eslint-disable-next-line no-unused-vars
    @Arg("channelId", () => Int) channelId: number
  ) {
    console.log("sub", root);
    return root.newMessageAdded;
  }
}