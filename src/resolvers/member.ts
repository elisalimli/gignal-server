import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Member } from "../entities/Member";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { isAuth } from "../middlewares/isAuth";
import { FieldError } from "../types/Error/FieldError";
import { AddTeamMemberInput } from "../types/Input/AddTeamMemberInput";
import { MyContext } from "../types/MyContext";
import { VoidResponse } from "../types/Response/VoidResponse";

@Resolver(Member)
export class MemberResolver {
  @Mutation(() => VoidResponse)
  @UseMiddleware(isAuth)
  async addTeamMember(
    @Arg("input") input: AddTeamMemberInput,
    @Ctx() { req }: MyContext
  ): Promise<VoidResponse> {
    const errors: FieldError[] = [];
    const { email, teamId } = input;
    // eslint-disable-next-line prefer-destructuring
    const userId = req.session.userId;

    const teamPromise = await Team.findOne({ where: { id: teamId } });
    const userToAddPromise = await User.findOne({ where: { email } });
    const [team, userToAdd] = await Promise.all([
      teamPromise,
      userToAddPromise,
    ]);

    if (team?.creatorId !== userId) {
      errors.push({ field: "email", message: "You aren't owner of the team" });
    }
    if (!userToAdd) {
      errors.push({
        field: "email",
        message: "Could not find user with this email",
      });
    }
    const isAlreadyMember = await Member.findOne({
      where: { teamId, userId: userToAdd?.id },
    });

    if (isAlreadyMember) {
      errors.push({
        field: "email",
        message: "This member already in the team",
      });
    }

    if (errors.length > 0)
      return {
        ok: false,
        errors,
      };
    try {
      await Member.create({ userId: userToAdd?.id, teamId }).save();
      return { ok: true };
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

  @Query(() => User, { nullable: true })
  async getMember(
    @Arg("userId", () => Int) userId: number
  ): Promise<User | null> {
    return User.findOne(userId);
  }
}
