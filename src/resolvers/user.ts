import argon2 from "argon2";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { FieldError } from "../types/Error/FieldError";
import { LoginInput } from "../types/Input/LoginInput";
import { RegisterInput } from "../types/Input/RegisterInput";
import { MyContext } from "../types/MyContext";
import { UserResponse } from "../types/Response/UserResponse";
import { validateRegister } from "../utils/validations/validateRegister";

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId !== user.id) return "";
    return user.email;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    //user not logged in
    const id = req.session.userId;
    if (!id) return null;
    return User.findOne(id);
  }

  @Query(() => [User], { nullable: true })
  allUsers(): Promise<User[] | null> {
    return User.find();
  }

  @FieldResolver(() => Boolean)
  async isYou(@Root() root: User, @Ctx() { req }: MyContext) {
    return req.session.userId === root.id;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors: FieldError[] = [];
    let user: User;
    // eslint-disable-next-line prefer-const
    user = (await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    )) as User;
    let valid = false;

    if (user) {
      valid = await argon2.verify(user.password, password);
    }

    if (!user) {
      errors.push({
        field: "usernameOrEmail",
        message: "Username or Email doesn't exist",
      });
    }

    if (!valid) {
      errors.push({ field: "password", message: "Password is incorrect" });
    }

    if (usernameOrEmail.length <= 2) {
      errors.push({
        field: "usernameOrEmail",
        message: "Must be greater than 2 characters.",
      });
    }
    if (password.length <= 2) {
      errors.push({
        field: "password",
        message: "Must be greater than 2 characters.",
      });
    }

    if (errors.length > 0) {
      return {
        errors,
      };
    }
    req.session.userId = user?.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: Error) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) return { errors };

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          // imageURL:
          //   "https://res.cloudinary.com/dvzql12lb/image/upload/v1612874862/download_nh0l3g-c_scale_h_56_otnzwk.png",
        })
        .returning("*")
        .execute();

      // eslint-disable-next-line prefer-destructuring
      user = result.raw[0];
    } catch (err: any) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "This username already taken",
            },
          ],
        };
      }
      console.log("error : ", err);
    }

    //store user id in session
    //keep logged in user
    req.session.userId = user.id;

    return {
      user,
    };
  }
}
