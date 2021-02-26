import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Team } from "./Team";
// import { User } from "./User";

@ObjectType()
@Entity()
export class Member extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @Column()
  userId!: number;

  @Field(() => Int)
  @Column()
  teamId!: number;

  @Field(() => Team)
  @ManyToOne(() => Team, (team) => team.members, {
    onDelete: "CASCADE",
  })
  team!: Team;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  admin: boolean;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
