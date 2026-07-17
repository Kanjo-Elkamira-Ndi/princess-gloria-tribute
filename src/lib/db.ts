import postgres from "postgres";

const globalForSql = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

export const sql =
  globalForSql.sql ??
  postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") globalForSql.sql = sql;
