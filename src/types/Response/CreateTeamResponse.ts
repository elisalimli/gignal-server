import { ObjectType, Field, Int } from "type-graphql";
import { FieldError } from "../Error/FieldError";
import { Team } from "../../entities/Team";

@ObjectType()
export class CreateTeamResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Team, { nullable: true })
  team?: Team;

  @Field(() => Int, { nullable: true })
  channelId?: number;
}
