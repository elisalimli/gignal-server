import { Session, SessionData } from "express-session";
import { PubSub } from "graphql-subscriptions";
import { Redis } from "ioredis";
import { createInvitedTeamsLoader } from "src/DataLoaders/CreateInvitedTeamsLoader";
import { ConnectionParams } from "subscriptions-transport-ws";
import { createChannelLoader } from "../DataLoaders/CreateChannelLoader";
import { createMessageCreatorLoader } from "../DataLoaders/CreateMessageCreatorLoader";

export interface MyContext {
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  res: Response & any;
  redis: Redis;
  pubsub: PubSub;
  channelLoader: ReturnType<typeof createChannelLoader>;
  connection: any;
}
