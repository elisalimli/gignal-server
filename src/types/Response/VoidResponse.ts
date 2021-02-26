import { ObjectType, Field } from "type-graphql";
import { FieldError } from "../Error/FieldError";

@ObjectType()
export class VoidResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean)
  ok?: boolean;
}
