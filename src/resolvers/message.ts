/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-body-style */
import { withFilter } from "graphql-subscriptions";
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
import { v4 } from "uuid";
import { MAX_FILE_SIZE, NEW_CHANNEL_MESSAGE } from "../constants";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { requiresAuth, requiresTeamAccess } from "../permissions";
import { CreateMessageInput } from "../types/Input/CreateMessageInput";
import { MyContext } from "../types/MyContext";
import { CreateMessageResponse } from "../types/Response/CreateMessageResponse";
import { pubsub } from "../utils/pubsub";
import { Channel } from "../entities/Channel";
import { PrivateChannelMember } from "../entities/PrivateChannelMember";
import { MessagesInput } from "../types/Input/MessagesInput";
import { PaginatedMessagesResponse } from "../types/Response/PaginatedMessagesResponse";

@Resolver(Message)
export class MessageResolver {
  @Query(() => PaginatedMessagesResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async messages(
    @Arg("input") { channelId, cursor, limit }: MessagesInput,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedMessagesResponse> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    console.log("herer");
    // const channel = await Channel.findOne(channelId);
    const [channel] = await getConnection().query(
      `select public from channel where id = ${channelId}`
    );

    if (!channel?.public) {
      const member = await PrivateChannelMember.findOne({
        where: { userId: req.session.userId },
      });
      if (!member) {
        throw new Error(
          "This channel is private,you must part of the channel."
        );
      }
    }

    const replacments: any[] = [channelId, realLimitPlusOne];

    if (cursor) replacments.push(cursor);
    const messages = await getConnection().query(
      `
      select m.*,
      json_build_object('id',u.id,
      'username',u.username) creator from message m
      join public.user u on u.id = m."creatorId"
      where "channelId" = $1
      ${cursor ? `and m."createdAt" < $3` : ""} 
      order by m."createdAt" DESC
      limit $2
  `,
      replacments
    );
    return {
      messages: messages.slice(0, realLimit),
      hasMore: messages.length === realLimitPlusOne,
    };
  }

  @Mutation(() => CreateMessageResponse)
  @UseMiddleware(isAuth)
  async createMessage(
    @Arg("input") input: CreateMessageInput,
    @Ctx() { req, bucket }: MyContext
  ): Promise<CreateMessageResponse> {
    let url: string | null = null;
    let fileType = null;

    const { text, channelId, file } = input;
    if (file) {
      const { createReadStream, mimetype, filename } = await file;
      const uploadStream = createReadStream() as any;
      let byteLength = 0;
      for await (const uploadChunk of uploadStream) {
        byteLength += (uploadChunk as Buffer).byteLength;
      }
      if (byteLength >= MAX_FILE_SIZE) {
        return {
          errors: [
            {
              field: "size",
              message: `File size must be less than ${
                MAX_FILE_SIZE / 1000000
              }MB`,
            },
          ],
        };
      }

      fileType = mimetype;
      const splittedFileType = filename.split(".");
      url = `${v4()}.${splittedFileType[splittedFileType.length - 1]}`;

      await new Promise((res) =>
        createReadStream()
          .pipe(
            bucket.file(url).createWriteStream({
              resumable: false,
              gzip: true,
            })
          )
          .on("finish", res)
      );
    }

    const message = await Message.create({
      text,
      channelId,
      url: url?.toString(),
      fileType: fileType?.toString(),
      creatorId: req.session.userId,
      createdAt: new Date().toISOString(),
    }).save();

    const asyncFo = async () => {
      const currentUser = await User.findOne(message.creatorId);

      pubsub.publish(NEW_CHANNEL_MESSAGE, {
        newMessageAdded: {
          ...message,
          creator: currentUser,
        },
      });
    };
    asyncFo();
    return {
      message,
    };
  }

  @Subscription(() => Message, {
    subscribe: requiresAuth.createResolver(
      requiresTeamAccess.createResolver(
        withFilter(
          () => {
            return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE);
          },
          async (payload, { channelId }) => {
            const message: Message = payload.newMessageAdded;
            return message.channelId === channelId;
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

  @FieldResolver(() => String, { nullable: true })
  url(@Root() root: Message) {
    return root.url
      ? `https://firebasestorage.googleapis.com/v0/b/${process.env.GOOGLE_STORAGE_PROJECT_NAME}/o/${root.url}?alt=media`
      : root.url;
  }
}
