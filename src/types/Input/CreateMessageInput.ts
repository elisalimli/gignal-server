import { InputType, Field, Int } from "type-graphql";

@InputType()
export class CreateMessageInput {
  @Field(() => Int)
  channelId: number;

  @Field()
  text: string;
}
