import { InputType, Field, Int } from "type-graphql";

// @Arg("channelId", () => Int) channelId: number,
// @Arg("limit", () => Int) limit: number,
// @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
@InputType()
export class MessagesInput {
  @Field(() => Int)
  channelId: number;

  @Field(() => Int)
  limit: number;

  @Field(() => String, { nullable: true })
  cursor: string | null;
}
