import DataLoader from "dataloader";
import { User } from "../entities/User";

//we give users' id and...
// [ 1,2,3,4 ]
//he run sql which give back to use user infos
//  [ {id:1,username:"ali"}, {id:2,username:"husi"}, {}, {} ]

export const createMessageCreatorLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    console.log("userid", userIds);
    const users = await User.findByIds(userIds as number[]);
    console.log("users", users);
    // const userIdToUser: Record<number, User> = {};
    // users.forEach((u) => (userIdToUser[u.id] = u));
    // return userIds.map((userId) => userIdToUser[userId]);
    return users;
  });
