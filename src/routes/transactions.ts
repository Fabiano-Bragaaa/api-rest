import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transaction").select();

    return { transactions };
  });

  app.get("/:id", async (request) => {
    const getTransactionByIdSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionByIdSchema.parse(request.params);

    const transaction = await knex("transaction").where("id", id).first();

    return {
      transaction,
    };
  });

  app.get("/summary", async () => {
    const summary = await knex("transaction")
      .sum("amount", { as: "amount" })
      .first();

    return { summary };
  });

  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transaction").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return response.status(201).send();
  });
}
