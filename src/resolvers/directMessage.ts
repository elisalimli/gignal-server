import {
  Arg,
  Ctx,
  Query,
  Resolver,
  UseMiddleware,
  Mutation,
} from "type-graphql";
import { getConnection } from "typeorm";
import { DirectMessage } from "../entities/DirectMessage";
import { Message } from "../entities/Message";
import { isAuth } from "../middlewares/isAuth";
import { CreateDirectMessageInput } from "../types/Input/CreateDirectMessageInput";
import { MyContext } from "../types/MyContext";
import { DirectMessagesInput } from "../types/Input/DirectMessagesInput";

// const pubsub = new PubSub();

@Resolver(DirectMessage)
export class DirectMessageResolver {
  @Query(() => [DirectMessage])
  @UseMiddleware(isAuth)
  async directMessages(
    @Arg("input") { teamId, otherUserId }: DirectMessagesInput,
    @Ctx() { req }: MyContext
  ): Promise<Message[] | null> {
    // return getConnection().query(
    //   `
    //     select m.*,
    //     json_build_object('id',u.id,
    //     'username',u.username) creator from message
    //     m join public.user u on u.id = m."creatorId"
    //     where "channelId" = $1
    //     order by "createdAt" ASC
    //     `,
    //   [channelId]
    // );
    return getConnection().query(
      `
       select dm.*,json_build_object('id',u.id,'username',u.username) creator from direct_message dm 
       join public.user u on u.id = dm."senderId" where dm."teamId" = $1 and 
       (dm."receiverId" = $2 and dm."senderId" = $3) 
       or (dm."receiverId" = $3 and dm."senderId" = $2)
       order by dm."createdAt" ASC
        `,
      [teamId, otherUserId, req.session.userId]
    );
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createDirectMessage(
    @Arg("input") input: CreateDirectMessageInput,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const { userId } = req.session;

    if (input.receiverId === userId) return false;
    await DirectMessage.create({
      ...input,
      senderId: userId,
      createdAt: new Date().toISOString(),
    }).save();
    // const asyncFo = async () => {
    //   const currentUser = await User.findOne(message.creatorId);
    //   pubsub.publish(NEW_CHANNEL_MESSAGE, {
    //     channelId,
    //     newMessageAdded: {
    //       ...message,
    //       creator: currentUser,
    //     },
    //   });
    // };
    // asyncFo();
    return true;
  }

  // @Subscription(() => Message, {
  //   subscribe: requiresAuth.createResolver(
  //     requiresTeamAccess.createResolver(
  //       withFilter(
  //         () => {
  //           return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE);
  //         },
  //         async (payload: Message, variables: { channelId: number }) => {
  //           return variables.channelId === payload.channelId;
  //         }
  //       )
  //     )
  //   ),
  // })
  // newMessageAdded(
  //   @Root() root: any,
  //   // eslint-disable-next-line no-unused-vars
  //   @Arg("channelId", () => Int) channelId: number
  // ) {
  //   return root.newMessageAdded;
  // }
}
