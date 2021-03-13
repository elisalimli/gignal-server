/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-body-style */
import { createWriteStream } from "fs";
import { withFilter } from "graphql-subscriptions";
import path from 'path';
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
  UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from 'uuid';
import { NEW_CHANNEL_MESSAGE, MAX_FILE_SIZE } from '../constants';
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { requiresAuth, requiresTeamAccess } from "../permissions";
import { CreateMessageInput } from "../types/Input/CreateMessageInput";
import { MyContext } from "../types/MyContext";
import { pubsub } from "../utils/pubsub";
import { CreateMessageResponse } from '../types/Response/CreateMessageResponse';

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



  @Mutation(() => CreateMessageResponse)
  @UseMiddleware(isAuth)
  async createMessage(
    @Arg("input") input: CreateMessageInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateMessageResponse> {

    let url = null;
    let fileType = null;

    const { text, channelId, file } = input;
    if (file) {
      const { createReadStream, mimetype, filename } = await file;
      const uploadStream = createReadStream();
      let byteLength = 0;
      for await (const uploadChunk of uploadStream) {
        byteLength += (uploadChunk as Buffer).byteLength;
      }
      if (byteLength >= MAX_FILE_SIZE) {
        return {
          errors: [
            {
              field: 'size',
              message: `File size must be less than ${MAX_FILE_SIZE / 1000000}MB`
            }
          ]
        }
      }

      fileType = mimetype;
      const splittedFileType = filename.split('.')
      url = `${v4()}.${splittedFileType[splittedFileType.length - 1]}`

      createReadStream().pipe(createWriteStream(path.join(__dirname, `../../files/${url}`)))

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
      message
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
    return root.url ? `http://localhost:4000/files/${root.url}` : root.url
  }


}
