import { InputType, Field, Int } from "type-graphql";

@InputType()
export class PrivateChannelMemberInput {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    channelId: number;
}
