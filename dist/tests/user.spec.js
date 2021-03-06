"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
let cookie = "";
describe("user resolvers", () => {
    test("should get all users", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("http://localhost:4000/graphql", {
            query: `
      query {
        allUsers {
          id
          username
          
        }
        }
        `,
        });
        const { data } = response;
        expect(data).toMatchObject({
            data: {
                allUsers: [
                    {
                        id: 1,
                        username: "test",
                    },
                ],
            },
        });
    }));
    test("should register", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("http://localhost:4000/graphql", {
            query: `
      mutation {
        register(options: { username: "test", email: "test@test.com", password: "test" }) {
          errors {
            field
            message
          }
          user {
            username
            email
          }
        }
      }
      
        `,
        });
        const { data } = response;
        expect(data).toMatchObject({
            data: {
                register: {
                    errors: null,
                    user: {
                        username: "test",
                        email: "test@test.com",
                    },
                },
            },
        });
    }));
    test("should login", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("http://localhost:4000/graphql", {
            query: `
      mutation {
        login(input: { usernameOrEmail: "test", password: "test" }) {
          errors {
            field
            message
          }
          user {
            username
            email
          }
        }
      }      
        `,
        });
        cookie = response.headers["set-cookie"][0].split(";")[0];
        const { data } = response;
        expect(data).toMatchObject({
            data: {
                login: {
                    errors: null,
                    user: {
                        username: "test",
                        email: "test@test.com",
                    },
                },
            },
        });
    }));
    test("should create team", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("http://localhost:4000/graphql", {
            query: `
      mutation {
        createTeam(name: "testTeam") {
          errors {
            field
            message
          }
          team {
            name
          }
        }
      }
           
        `,
        }, {
            headers: {
                cookie,
            },
        });
        const { data } = response;
        console.log("data", data);
        expect(data).toMatchObject({
            data: {
                createTeam: {
                    errors: null,
                    team: {
                        name: "testTeam",
                    },
                },
            },
        });
    }));
});
//# sourceMappingURL=user.spec.js.map