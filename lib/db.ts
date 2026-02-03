import { createClient } from "@libsql/client/web";
import { initSchema } from "./db-schema";

export type LibSQLClient = {
  execute: (input: { sql: string; args?: any[] } | string) => Promise<any>;
};

function readEnv(key: string): string | undefined {
  const meta = (import.meta as any)?.env?.[key];
  if (typeof meta === "string" && meta.length) return meta;

  const proc = (globalThis as any)?.process?.env?.[key];
  if (typeof proc === "string" && proc.length) return proc;

  const globalVal = (globalThis as any)?.[key];
  if (typeof globalVal === "string" && globalVal.length) return globalVal;

  return undefined;
}

function getDbConfig(): { url: string; authToken?: string } {
  const url = readEnv("TURSO_DB_URL") || readEnv("TURSO_DATABASE_URL");
  const token =
    readEnv("TURSO_DB_AUTH_TOKEN") || readEnv("TURSO_AUTH_TOKEN");

  if (!url) {
    throw new Error("Missing TURSO_DB_URL (or TURSO_DATABASE_URL) in environment");
  }

  const authToken = token && token.trim().length ? token.trim() : undefined;
  return { url, authToken };
}

// Run schema init once per isolate using a short-lived client.
let schemaInitPromise: Promise<void> | null = null;

async function ensureSchemaInitialized() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const { url, authToken } = getDbConfig();

      const opts: any = {
        url,
        fetch: globalThis.fetch, // critical: force Web fetch path
      };
      if (authToken) opts.authToken = authToken;

      const db = createClient(opts) as unknown as LibSQLClient;
      await initSchema(db);
    })().catch((err) => {
      schemaInitPromise = null;
      throw err;
    });
  }

  await schemaInitPromise;
}

export async function getDb(): Promise<LibSQLClient> {
  await ensureSchemaInitialized();

  const { url, authToken } = getDbConfig();

  const opts: any = {
    url,
    fetch: globalThis.fetch, // critical: force Web fetch path
  };
  if (authToken) opts.authToken = authToken;

  return createClient(opts) as unknown as LibSQLClient;
}
