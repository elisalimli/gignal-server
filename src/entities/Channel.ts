import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Team } from "./Team";

@ObjectType()
@Entity()
export class Channel extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: true })
  public: boolean;

  //dm => direct message channel 
  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  dm: boolean;

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.channels)
  users: User[];

  @Field(() => [Message], { nullable: true })
  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @Field(() => Team)
  @OneToMany(() => Team, (team) => team.channels, { onDelete: "CASCADE" })
  team: Team;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.teams)
  creator!: User;

  @Field()
  @Column()
  creatorId!: number;

  @Field()
  @Column()
  teamId!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
