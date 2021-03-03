import { InputType, Field, Int } from "type-graphql";

@InputType()
export class DirectMessagesInput {
  @Field(() => Int)
  teamId: number;

  @Field(() => Int)
  otherUserId: number;
}
