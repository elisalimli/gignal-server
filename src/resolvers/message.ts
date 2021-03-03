/* eslint-disable arrow-body-style */
import { PubSub, withFilter } from "graphql-subscriptions";
import {
  Arg,
  Ctx,
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
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { CreateMessageInput } from "../types/Input/CreateMessageInput";
import { MyContext } from "../types/MyContext";
import { requiresTeamAccess, requiresAuth } from "../permissions";
import { NEW_CHANNEL_MESSAGE } from "../constants";

const pubsub = new PubSub();

@Resolver(Message)
export class MessageResolver {
  @Query(() => [Message], { nullable: true })
  @UseMiddleware(isAuth)
  async messages(
    @Arg("channelId", () => Int) channelId: number
  ): Promise<Message[] | null> {
    console.log("messsage hher");
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
      createdAt: new Date().toISOString(),
    }).save();
    //ads
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

  // async subscribe(rootValue,sad args, context) {
  //   const userId = await getUserId(subscribeContext);
  //   return withFilter(() => context.pubsub.asyncIterator('group'), filter)(rootValue, args, context);
  // },
  @Subscription(() => Message, {
    subscribe: requiresAuth.createResolver(
      requiresTeamAccess.createResolver(
        withFilter(
          () => {
            return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE);
          },
          async (payload: Message, variables: { channelId: number }) => {
            return variables.channelId === payload.channelId;
          }
        )
      )
    ),
  })
  newMessageAdded(
    @Root() root: any,
    // eslint-disable-next-line no-unused-vars
    @Arg("channelId", () => Int) channelId: number
  ) {
    return root.newMessageAdded;
  }
}
