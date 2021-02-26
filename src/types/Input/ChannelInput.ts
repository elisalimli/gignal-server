import { InputType, Field, Int } from "type-graphql";

@InputType()
export class ChannelInput {
  @Field(() => Int)
  teamId: number;

  @Field(() => Int)
  channelId: number;
}
