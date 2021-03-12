import { GraphQLUpload } from "graphql-upload";
import { Field, InputType, Int } from "type-graphql";
import { File } from "./File";

@InputType()
export class CreateMessageInput {
  @Field(() => Int)
  channelId: number;

  @Field(() => String, { nullable: true })
  text: string;

  @Field(() => GraphQLUpload, { nullable: true })
  file: File;
}
