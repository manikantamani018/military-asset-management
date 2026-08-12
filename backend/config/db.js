import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const db = new Pool({
    // Render PostgreSQL
    // Local development can still use the individual DB_* variables
    ...(process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,

              // Render PostgreSQL uses SSL
              ssl: isProduction
                  ? {
                        rejectUnauthorized: false
                    }
                  : false
          }
        : {
              // Local Docker PostgreSQL
              host: process.env.DB_HOST || "localhost",

              port:
                  Number(process.env.DB_PORT) || 5432,

              database:
                  process.env.DB_NAME ||
                  "military_assets",

              user:
                  process.env.DB_USER ||
                  "postgres",

              password:
                  process.env.DB_PASSWORD ||
                  "postgres"
          }),

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

  // DATABASE CONNECTION
  
db.on("connect", () => {
    console.log(
        "PostgreSQL connected successfully"
    );
});

  // DATABASE ERROR
  
db.on("error", (error) => {
    console.error(
        "Unexpected PostgreSQL error:",
        error
    );
});

export default db;