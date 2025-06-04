import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";

const app = fastify();

app.get("/hello", async () => {
  const transaction = await knex("transaction")
    .where("amount", 1000)
    .select("*");

  return transaction;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP server running!");
  });
