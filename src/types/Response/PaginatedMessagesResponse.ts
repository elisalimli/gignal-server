import { Field, ObjectType } from "type-graphql";
import { Message } from "../../entities/Message";

@ObjectType()
export class PaginatedMessagesResponse {
  @Field(() => [Message])
  messages?: Message[];

  @Field(() => Boolean)
  hasMore?: boolean;
}
