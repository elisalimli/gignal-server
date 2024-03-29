import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

export interface MyContext {
  req: Request & {
    session: Session &
    Partial<SessionData> & { userId?: number };
  };
  res: Response & any;
  redis: Redis;
  connection: any;
  bucket: any;
}
