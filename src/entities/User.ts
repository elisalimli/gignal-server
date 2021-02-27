import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Team } from "./Team";
import { Message } from "./Message";
import { Channel } from "./Channel";
// import { Member } from "./Member";
import { Member } from "./Member";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ unique: true })
  username!: string;

  @Field(() => String)
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // @Field(() => [Team])
  @OneToMany(() => Team, (team) => team.creator)
  teams: Team[];

  @OneToMany(() => Channel, (channel) => channel.users)
  channels: Channel[];

  @OneToMany(() => Message, (message) => message.creator)
  messages: Message[];

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  // @OneToMany(() => Member, (member) => member.member)
  // members: Member[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
