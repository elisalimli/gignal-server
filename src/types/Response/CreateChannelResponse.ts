import { ObjectType, Field } from "type-graphql";
import { FieldError } from "../Error/FieldError";
import { Channel } from "../../entities/Channel";

@ObjectType()
export class CreateChannelResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Channel, { nullable: true })
  channel?: Channel;
}
