/* eslint-disable max-classes-per-file */
import { ObjectType, Field, Int } from "type-graphql";
import { FieldError } from "../Error/FieldError";

@ObjectType()
class DMChannel {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  name?: string;
}

@ObjectType()
export class GetOrCreateChannelResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => DMChannel, { nullable: true })
  channel?: DMChannel;
}
