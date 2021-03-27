import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getManager } from "typeorm";
import { Channel } from "../entities/Channel";
import { Member } from "../entities/Member";
import { Team } from "../entities/Team";
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { MyContext } from "../types/MyContext";
import { CreateTeamResponse } from "../types/Response/CreateTeamResponse";

@Resolver(Team)
export class TeamResolver {
  @Query(() => [Team], { nullable: true })
  @UseMiddleware(isAuth)
  async teams(@Ctx() { req }: MyContext): Promise<Team[] | null> {
    return getConnection().query(
      `
      select id,name from team where "creatorId" = $1 order by "createdAt" DESC;
       `,
      [req.session.userId]
    );
  }

  @Query(() => [Team], { nullable: true })
  async invitedTeams(@Ctx() { req }: MyContext): Promise<Team[] | null> {
    return getConnection().query(
      `
      select t.id,t.name from member m join team t on t.id = m."teamId" 
      where m."userId" = $1 and t."creatorId" != $1 order by t."createdAt" DESC;
      `,
      [req.session.userId]
    );
  }

  @Mutation(() => Boolean)
  async deleteTeam(@Arg("teamId", () => Int) teamId: number) {
    await Team.delete(teamId, {});
    return true;
  }

  @Query(() => Team, { nullable: true })
  @UseMiddleware(isAuth)
  async team(
    @Arg("teamId", () => Int) teamId: number
  ): Promise<Team | undefined> {
    return Team.findOne(teamId);
  }

  @FieldResolver(() => [Member], { nullable: true })
  @UseMiddleware(isAuth)
  async directMessagesMembers(@Root() root: Team, @Ctx() { req }: MyContext) {
    return getConnection().query(
      `
       select distinct on (u.id) u.id,u.username from direct_message dm
        join "user" u on (dm."receiverId" = u.id) or 
       (dm."senderId" = u.id)  where (dm."receiverId" = $1 or dm."senderId" = $1)
        and dm."teamId" = $2 and u.id != $1 
       
      `,
      [req.session.userId, root.id]
    );
  }

  @FieldResolver(() => [Channel], { nullable: true })
  @UseMiddleware(isAuth)
  async channels(@Root() root: Team, @Ctx() { req }: MyContext) {
    return getConnection().query(
      `
      select distinct on (c.id) c.* from channel c 
      left join private_channel_member pcm on pcm."userId" = $2
      where c."teamId" = $1 and (c.public = true or c.id = pcm."channelId")
       `,
      [root.id, req.session.userId]
    );
  }

  @Mutation(() => CreateTeamResponse)
  @UseMiddleware(isAuth)
  async createTeam(
    @Arg("name") name: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: MyContext
  ): Promise<CreateTeamResponse> {
    const errors: FieldError[] = [];

    if (name.length <= 2) {
      errors.push({
        field: "name",
        message: "Team name must be greater than 2",
      });
    }
    if (errors.length > 0)
      return {
        errors,
      };
    try {
      const res = await getManager().transaction(async () => {
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Team)
          .values({
            name,
            creatorId: userId,
            admin: true,
          })
          .returning("*")
          .execute();
        const newTeam = result.raw[0];

        const { id } = await Channel.create({
          creatorId: userId,
          name: "general",
          teamId: newTeam.id,
        }).save();

        Member.create({
          admin: true,
          teamId: newTeam.id,
          userId,
        }).save();

        return {
          team: newTeam,
          channelId: id,
        };
      });

      return res;
    } catch (err) {
      console.log("error", err);
      if (err.code == 23505) {
        return {
          errors: [
            {
              field: "name",
              message: "This name has b0een taken already",
            },
          ],
        };
      }
      return {
        errors: [
          {
            field: "general",
            message: "Something went wrong,please try again",
          },
        ],
      };
    }
  }

  @FieldResolver(() => Boolean)
  admin(@Root() root: Team, @Ctx() { req }: MyContext) {
    return root.creatorId === req.session.userId;
  }

  @Query(() => [Member])
  async getTeamMembers(
    @Arg("teamId", () => Int) teamId: number,
    @Ctx() { req }: MyContext
  ): Promise<Member[]> {
    return getConnection().query(
      `
      select m.*,json_build_object('id',u.id,'username',u.username) "user" from member m
      join public.user u on u.id = m."userId" where m."teamId" = $1 and m."userId" != $2
      `,
      [teamId, req.session.userId]
    );
  }
}
