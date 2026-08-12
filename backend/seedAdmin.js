import bcrypt from "bcrypt";
import db from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
    try {
        const username = "admin_user";
        const password = "AdminPass123!";

        const existing = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );

        if (existing.rows.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users
                (username, password_hash, role, base_id)
             VALUES
                ($1, $2, 'ADMIN', NULL)
             RETURNING id, username, role`,
            [username, passwordHash]
        );

        console.log("Admin created successfully:");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Failed to create admin:", error);
    } finally {
        await db.end();
    }
};

createAdmin();