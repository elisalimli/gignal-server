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
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { MyContext } from "../types/MyContext";
import { CreateTeamResponse } from "../types/Response/CreateTeamResponse";

@Resolver(Team)
export class TeamResolver {
  @Query(() => [Team], { nullable: true })
  @UseMiddleware(isAuth)
  async teams(@Ctx() { req }: MyContext): Promise<Team[] | null> {
    // return Team.find({
    //   where: { creatorId: req.session.userId },
    // });

    return getConnection().query(
      `
      select id,name from team where "creatorId" = $1 ;
       `,
      [req.session.userId]
    );
  }

  @Query(() => [Team], { nullable: true })
  async invitedTeams(@Ctx() { req }: MyContext): Promise<Team[] | null> {
    return getConnection().query(
      `
      select t.id,t.name from member m join team t on t.id = m."teamId" where m."userId" = $1
      `,
      [req.session.userId]
    );
    // select t.*,json_build_object('password',u.password) creator from team t join "member" m on m."teamId" = t.id join "user" u on u.id = m."userId";

    // select * from team t inner join "user" u on u.id = t."creatorId";

    // SELECT *
    // FROM weather INNER JOIN cities ON (weather.city = cities.name);
    // console.log("look teams bud a", teams);
  }

  @Mutation(() => Boolean)
  async deleteTeam(@Arg("teamId", () => Int) teamId: number) {
    await Team.delete(teamId, {});
    return true;
  }

  @FieldResolver(() => Boolean)
  async admin(@Ctx() { req }: MyContext, @Root() root: Team) {
    return req.session.userId === root.creatorId;
  }

  @Query(() => Team, { nullable: true })
  @UseMiddleware(isAuth)
  async team(
    @Arg("teamId", () => Int) teamId: number
  ): Promise<Team | undefined> {
    //array_to_json(array_agg(c.*))
    //      select t.*,json_build_object('id',cr.id,'username',cr.username) creator,json_build_object('id',c.id,'name',c.name,'teamId',c."teamId") channels from team t left join member m on m."teamId" = t.id
    // join public.user cr on cr.id = t."creatorId" left join public.user u on u.id = m."userId" left join channel c on c."teamId" = $1 where t.id = $1
    //
    //      select t.*,
    //  json_build_object('id',cr.id,'username',cr.username) creator,
    //  array_agg(json_build_object('id',c.id,'name',c.name,'teamId',c."teamId")) channels,
    //  array_agg(json_build_object('id',u.id,'username',u.username)) members
    //  from team t
    //  left join member m on m."teamId" = t.id
    //  left join public.user u on u.id = m."userId"
    //  join public.user cr on cr.id = t."creatorId"
    //  left join channel c on c."teamId" = 41 where t.id = 41
    //  group by t.id,cr.id,m.id

    const res = (
      await getConnection().query(
        `
       select t.*,
       array_agg(json_build_object('id',c.id,'name',c.name,'teamId',c."teamId")) channels
       from team t 
       left join channel c on c."teamId" = $1 where t.id = $1

       group by t.id
      `,
        [teamId]
      )
    )[0];
    console.log("here res buddy", res);
    return res;
  }

  @FieldResolver(() => [User], { nullable: true })
  async members(@Root() root: Team) {
    return getConnection().query(
      `
    select * from member m  join public.user u on u.id = m."userId" where m."teamId" = $1
    `,
      [root.id]
    );
  }

  // @FieldResolver(() => Member, { nullable: true })
  // async members(@Root() root: Team) {
  //   const member = await Member.findOne({ where: { teamId: root.id } });
  //   const user = await User.findOne(member?.userId);
  //   // console.log('ex',user)
  //   member?.member = user;
  //   return member;
  // }

  // @FieldResolver(() => User, { nullable: true })
  // async member(@Root() root: Member) {
  //   const abc = await User.findOne(root.userId);
  //   console.log("heaj", abc);
  //   return "abc";
  // }

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

    const teamPromise = Team.findOne({
      where: { name },
    });

    const [team] = await Promise.all([teamPromise]);

    if (team) {
      errors.push({
        field: "name",
        message: "Team's name must be unique",
      });
    }

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
        const newTeam = await Team.create({
          name,
          creatorId: userId,
        }).save();

        const { id } = await Channel.create({
          creatorId: userId,
          name: "general",
          teamId: newTeam.id,
        }).save();
        return {
          team: newTeam,
          channelId: id,
        };
      });

      return res;
    } catch (err) {
      console.log("error", err);
      if (err.code === 23505) {
        return {
          errors: [
            {
              field: "name",
              message: "this name has been taken already",
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
}