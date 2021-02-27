import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Channel } from "./Channel";
import { User } from "./User";

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  text!: string;

  @Field(() => Int)
  @Column()
  channelId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.messages)
  creator!: User;

  @Field(() => Int)
  @Column()
  creatorId!: number;

  @Field(() => Channel)
  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: "CASCADE",
  })
  channel!: Channel;

  @Field(() => String)
  @Column()
  createdAt: String;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  // @Field(() => String)
  // @Column()
  // createdAt: string;

  //   @Field()
  //   @ManyToOne(() => User, (user) => user.posts)
  //   creator!: User;
}
