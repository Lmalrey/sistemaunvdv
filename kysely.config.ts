import { defineConfig } from "kysely-ctl";
import { Kysely } from "kysely";
import { dialect } from "./src/lib/server/database";

export default defineConfig({
  dialect,
  migrations: {
    migrationFolder: "src/lib/server/migrations"
  },
  seeds: {
  }
});