import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;


const db = new Pool({

    host:
        process.env.DB_HOST || "localhost",

    port:
        Number(process.env.DB_PORT) || 5432,

    database:
        process.env.DB_NAME || "military_assets",

    user:
        process.env.DB_USER || "postgres",

    password:
        process.env.DB_PASSWORD || "postgres",

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 5000

});


db.on(
    "connect",
    () => {

        console.log(
            "PostgreSQL connected successfully"
        );

    }
);


db.on(
    "error",
    (error) => {

        console.error(
            "Unexpected PostgreSQL error:",
            error
        );

    }
);


export default db;