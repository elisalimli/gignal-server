import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  text: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  url: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  fileType: string;

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


}
