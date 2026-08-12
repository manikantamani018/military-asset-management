import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// REGISTER USER
export const registerUser = async (req, res) => {

    try {

        const {
            username,
            password,
            role,
            baseId
        } = req.body;


        // Validate required fields

        if (!username || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "Username, password and role are required"
            });

        }


        // Check whether username already exists

        const existingUser = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });

        }


        // Hash password

        const passwordHash = await bcrypt.hash(password, 10);


        // Create user

        const result = await db.query(

            `INSERT INTO users
                (username, password_hash, role, base_id)
             VALUES
                ($1, $2, $3, $4)
             RETURNING id, username, role, base_id`,

            [
                username,
                passwordHash,
                role,
                baseId || null
            ]

        );


        res.status(201).json({

            success: true,

            message: "User registered successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error("Register error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to register user",

            error: error.message

        });

    }

};


// LOGIN

export const loginUser = async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message: "Username and password are required"

            });

        }


        // Find user

        const result = await db.query(

            `SELECT
                id,
                username,
                password_hash,
                role,
                base_id
             FROM users
             WHERE username = $1`,

            [username]

        );


        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"

            });

        }


        const user = result.rows[0];


        // Compare password

        const passwordMatch = await bcrypt.compare(

            password,

            user.password_hash

        );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"

            });

        }


        // Create JWT

        const token = jwt.sign(

            {
                userId: user.id,
                username: user.username,
                role: user.role,
                baseId: user.base_id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "8h"
            }

        );


        res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {

                id: user.id,

                username: user.username,

                role: user.role,

                baseId: user.base_id

            }

        });


    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({

            success: false,

            message: "Login failed",

            error: error.message

        });

    }

};


// GET CURRENT USER

export const getCurrentUser = async (req, res) => {

    try {

        const result = await db.query(

            `SELECT
                id,
                username,
                role,
                base_id
             FROM users
             WHERE id = $1`,

            [req.user.userId]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        res.status(200).json({

            success: true,

            user: result.rows[0]

        });


    } catch (error) {

        console.error("Current user error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to get current user"

        });

    }

};