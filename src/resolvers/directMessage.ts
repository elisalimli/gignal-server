import { withFilter } from "graphql-subscriptions";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { NEW_DIRECT_MESSAGE } from "../constants";
import { DirectMessage } from "../entities/DirectMessage";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { directMessageSubscriptionCheck, requiresAuth } from "../permissions";
import { CreateDirectMessageInput } from "../types/Input/CreateDirectMessageInput";
import { DirectMessagesInput } from "../types/Input/DirectMessagesInput";
import { DirectMessageSubscriptionInput } from "../types/Input/DirectMessageSubscriptionInput";
import { MyContext } from "../types/MyContext";
import { pubsub } from "../utils/pubsub";

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
       join public.user u on u.id = dm."senderId" where 
       (dm."receiverId" = $2 and dm."senderId" = $3 
       or dm."receiverId" = $3 and dm."senderId" = $2)
       and dm."teamId" = $1
       order by dm."createdAt" ASC
        `,
      [teamId, otherUserId, req.session.userId]
    );
  }

  // @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  // async createDirectMessage(
  //   @Arg("input") input: CreateDirectMessageInput,
  //   @Ctx() { req }: MyContext
  // ): Promise<Boolean> {
  //   const { userId } = req.session;

  //   if (input.receiverId === userId) return false;
  //   const message = await DirectMessage.create({
  //     ...input,
  //     senderId: userId,
  //     createdAt: new Date().toISOString(),
  //   }).save();
  //   const asyncFo = async () => {
  //     // const currentUser = await User.findOne(message.creatorId);
  //     pubsub.publish(NEW_DIRECT_MESSAGE, {
  //       newDirectMessageAdded: {
  //         ...message,
  //       },
  //     });
  //   };
  //   asyncFo();
  //   return true;
  // }

  // @Subscription(() => DirectMessage, {
  //   subscribe: requiresAuth.createResolver(
  //     requiresTeamAccess.createResolver(
  //       withFilter(
  //         () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
  //         async (
  //           payload: DirectMessage,
  //           variables: { teamId: number; userId: number },
  //           { req }: MyContext
  //         ) => {
  //           console.log("sesion", req.session);
  //           // return (
  //           //   variables.teamId === payload.teamId &&
  //           //   (payload.senderId === req.session.userId ||
  //           //     payload.receiverId === req.session.userId)
  //           // );
  //           return 2 === 2;
  //         }
  //       )
  //     )
  //   ),
  // })
  // @Subscription(() => Message, {
  //   subscribe: requiresAuth.createResolver(
  //     requiresTeamAccess.createResolver(
  //       withFilter(
  //         () => {
  //           return pubsub.asyncIterator(NEW_DIRECT_MESSAGE);
  //         },
  //         async (payload: Message, variables: { channelId: number }) => {
  //           return true;
  //         }
  //       )
  //     )
  //   ),
  // })
  // newDirectMessageAdded(
  //   @Root() root: any,
  //   @Arg("input", () => DirectMessageSubscriptionInput)
  //   _: DirectMessageSubscriptionInput
  // ) {
  //   console.log("seperated root", root);
  //   return root;
  // }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createDirectMessage(
    @Arg("input") input: CreateDirectMessageInput,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const { userId } = req.session;

    if (input.receiverId === userId) return false;
    const message = await DirectMessage.create({
      ...input,
      senderId: userId,
      createdAt: new Date().toISOString(),
    }).save();

    const asyncFo = async () => {
      const { username, id } = (await User.findOne(message.senderId)) as User;

      pubsub.publish(NEW_DIRECT_MESSAGE, {
        newDirectMessageAdded: {
          ...message,
          creator: {
            id,
            username,
          },
        },
      });
    };
    asyncFo();
    return true;
  }

  @Subscription(() => DirectMessage, {
    subscribe: requiresAuth.createResolver(
      directMessageSubscriptionCheck.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
          async (payload, variables, context) => {
            const userId = context.connection.context?.req?.session.userId;

            return (
              variables.input.teamId === payload.newDirectMessageAdded.teamId &&
              (payload.newDirectMessageAdded.senderId === userId ||
                payload.newDirectMessageAdded.receiverId === userId)
            );
          }
        )
      )
    ),
  })
  newDirectMessageAdded(
    @Root() root: any,
    @Arg("input", () => DirectMessageSubscriptionInput)
    _: DirectMessageSubscriptionInput
  ) {
    return root.newDirectMessageAdded;
  }
}
