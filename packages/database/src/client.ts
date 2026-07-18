import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@database/schema";

const url = process.env.DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const dbClient = createClient({ url, authToken });
export const db = drizzle(dbClient, { schema });
