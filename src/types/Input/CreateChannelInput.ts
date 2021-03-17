import { InputType, Field, Int } from "type-graphql";

@InputType()
export class CreateChannelInput {
  @Field(() => Int)
  teamId: number;

  @Field()
  name: string;

  @Field(() => Boolean)
  isPublic: boolean;

  @Field(() => [Int])
  members: number[]
}
