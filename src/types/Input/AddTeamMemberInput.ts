import { InputType, Field, Int } from "type-graphql";

@InputType()
export class AddTeamMemberInput {
  @Field(() => Int)
  teamId: number;

  @Field()
  email: string;
}
