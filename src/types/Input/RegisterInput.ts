import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
