import axios from "axios";
import { resolveNs } from "dns";

let cookie = "";
describe("user resolvers", () => {
  test("should get all users", async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
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
  });

  test("should register", async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
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
  });

  test("should login", async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
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
  });

  test("should create team", async () => {
    const response = await axios.post(
      "http://localhost:4000/graphql",
      {
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
      },
      {
        headers: {
          cookie,
        },
      }
    );
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
  });
});
