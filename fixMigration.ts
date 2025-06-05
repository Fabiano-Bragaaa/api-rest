import knexModule from "knex";
import { config } from "./src/database";

async function main() {
  const knex = knexModule(config);

  try {
    await knex("knex_migrations")
      .where("name", "20250604193027_add-session-id-to-transactions.ts")
      .del();

    console.log("Migration corrompida removida com sucesso.");
  } catch (error) {
    console.error("Erro ao remover migration:", error);
  } finally {
    await knex.destroy();
  }
}

main();
