import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { createChannelLoader } from "../DataLoaders/CreateChannelLoader";

export interface MyContext {
  req: Request & {
    session: Session &
    Partial<SessionData> & { userId?: number };
  };
  res: Response & any;
  redis: Redis;
  channelLoader: ReturnType<typeof createChannelLoader>;
  connection: any;
}
