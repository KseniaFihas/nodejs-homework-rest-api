const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

const { DB_HOST, PORT = 3000 } = process.env;
/* eslint-disable */
describe("tests for login controllers", () => {
  beforeAll(() =>
    mongoose
      .connect(DB_HOST)
      .then(() => {
        console.log("database connection successful");
        app.listen(PORT, () => {
          console.log(`Server running. Use our API on port: ${PORT}`);
        });
      })
      .catch((error) => {
        console.log(`Server is not running. Error message: ${error.message}`);
        process.exit(1);
      })
  );


describe("login", () => {
  test("should return status code 200 and response body must contain a token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email:"ksenia.fihas@gmail.com",
    password:"857423",
      });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");
  }, 15000);
});
});