import { InputType, Field, Int } from "type-graphql";

@InputType()
export class DirectMessageSubscriptionInput {
  @Field(() => Int)
  teamId: number;

  @Field(() => Int)
  receiverId: number;
}
