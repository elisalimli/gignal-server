import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Channel } from "./Channel";
import { Member } from "./Member";
import { PrivateChannelMember } from './PrivateChannelMember';

@ObjectType()
@Entity()
export class Team extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "varchar", unique: true })
  name!: string;

  @Field(() => Boolean)
  @Column({ type: "boolean" })
  admin!: boolean;

  @ManyToOne(() => User, (user) => user.teams)
  creator!: User;

  @Field()
  @Column()
  creatorId!: number;

  @Field(() => [Channel])
  @OneToMany(() => Channel, (channel) => channel.team)
  channels!: Channel[];

  @OneToMany(() => Member, (member) => member.team, { cascade: true })
  members: Member[];

  @OneToMany(() => PrivateChannelMember, (pcMember) => pcMember.team, { cascade: true })
  privateChannelMembers: PrivateChannelMember[];

  @Field(() => [User])
  directMessagesMembers: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
