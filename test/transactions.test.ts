import { afterAll, beforeAll, beforeEach, expect, test } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { describe } from "node:test";
import { execSync } from "node:child_process";

describe("transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });
  test("user can create a new transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "new transaction",
      amount: 500,
      type: "credit",
    });

    expect(response.statusCode).toEqual(201);
  });

  test("should be able list to all transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 500,
        type: "credit",
      });

    const cookies = createTransactionResponse.headers["set-cookie"];

    const listResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "new transaction",
        amount: 500,
      }),
    ]);
  });
  test("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 500,
        type: "credit",
      });

    const cookies = createTransactionResponse.headers["set-cookie"];

    const listResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const id = listResponse.body.transactions[0].id;

    const getTransactionReponse = await request(app.server)
      .get(`/transactions/${id}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionReponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "new transaction",
        amount: 500,
      })
    );
  });
  test("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.headers["set-cookie"];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "debit transact",
        amount: 2000,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({ amount: 3000 });
  });
});
