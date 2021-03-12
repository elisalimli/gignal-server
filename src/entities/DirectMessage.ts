import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity("direct_message")
export class DirectMessage extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @Column()
  teamId!: number;

  @Field(() => Int)
  @Column()
  receiverId!: number;

  @Field(() => Int)
  @Column()
  senderId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.directMessages)
  creator!: User;

  @Field(() => String)
  @Column()
  text: string;

  @Field(() => String)
  @Column()
  createdAt: String;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}
