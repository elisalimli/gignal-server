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

@ObjectType()
@Entity()
export class Team extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "varchar", unique: true })
  name!: string;

  @ManyToOne(() => User, (user) => user.teams)
  creator!: User;

  @Field()
  @Column()
  creatorId!: number;

  @Field(() => [Channel])
  @OneToMany(() => Channel, (channel) => channel.team)
  channels!: Channel[];

  @Field(() => [Member])
  @OneToMany(() => Member, (member) => member.team, { cascade: true })
  members: Member[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
