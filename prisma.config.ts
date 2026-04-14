import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL!,
    shadowDatabaseUrl: process.env.DIRECT_URL!,
  },
  schema: "./prisma/schema.prisma",
});
