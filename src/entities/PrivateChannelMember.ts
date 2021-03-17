

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
import { User } from "./User";

@ObjectType()
@Entity()
export class PrivateChannelMember extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Int)
    @Column()
    userId!: number;

    @Field(() => Int)
    @Column()
    channelId!: number;

    @Field(() => Team)
    @ManyToOne(() => Team, (team) => team.privateChannelMembers, {
        onDelete: "CASCADE",
    })
    team!: Team;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.privateChannelMembers, {
        onDelete: "CASCADE",
    })
    user!: User;

    @Field(() => Boolean)
    isYou: boolean;

    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
    admin: boolean;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
