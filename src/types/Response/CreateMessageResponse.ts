import { Field, ObjectType } from "type-graphql";
import { Message } from '../../entities/Message';
import { FieldError } from "../Error/FieldError";

@ObjectType()
export class CreateMessageResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Message, { nullable: true })
    message?: Message;
}
