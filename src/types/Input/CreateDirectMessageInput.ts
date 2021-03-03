import { InputType, Field, Int } from "type-graphql";

@InputType()
export class CreateDirectMessageInput {
  @Field(() => Int)
  receiverId: number;

  @Field(() => Int)
  teamId: number;

  @Field()
  text: string;
}
