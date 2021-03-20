import { Field, InputType, Int } from "type-graphql";

@InputType()
export class GetOrCreateChannelInput {
    @Field(() => [Int])
    members!: number[];

    @Field(() => Int)
    teamId!: number
}
