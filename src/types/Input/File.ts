// import { ReadStream } from "fs";
// import { Field, InputType } from "type-graphql";

// @InputType()
// export class File {
//   @Field(() => String, { nullable: true })
//   type: string;

//   @Field(() => String, { nullable: true })
//   path: string;


// }

import { Stream } from "stream";


export interface File {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}