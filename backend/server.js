import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import db from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";

import {
    authenticateToken
} from "./middlewares/authMiddleware.js";

import {
    authorizeRoles
} from "./middlewares/rbacMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// MIDDLEWARE

app.use(helmet());

app.use(cors());

app.use(express.json());


// AUTH ROUTES

app.use(
    "/api/auth",
    authRoutes
);


// ASSET ROUTES

app.use(
    "/api/assets",
    assetRoutes
);


 // BASE / EQUIPMENT / EXPENDITURE ROUTES
 
app.use(
    "/api",
    assetRoutes
);


 // PURCHASE ROUTES
 
app.use(
    "/api/purchases",
    purchaseRoutes
);


 // TRANSFER ROUTES
 
app.use(
    "/api/transfers",
    transferRoutes
);


 // ASSIGNMENTS
 
// GET ASSIGNMENTS

app.get(
    "/api/assignments",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),
    async (req, res) => {

        try {

            const result = await db.query(`
                SELECT
                    a.id,
                    a.base_id,
                    b.name AS base_name,
                    a.equipment_type_id,
                    e.name AS equipment_name,
                    e.category,
                    a.personnel_name,
                    a.quantity,
                    a.assigned_date,
                    a.assigned_by

                FROM assignments a

                LEFT JOIN bases b
                    ON a.base_id = b.id

                LEFT JOIN equipment_types e
                    ON a.equipment_type_id = e.id

                ORDER BY
                    a.id DESC
            `);


            res.status(200).json({

                success: true,

                count:
                    result.rows.length,

                assignments:
                    result.rows

            });

        } catch (error) {

            console.error(
                "Get assignments error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch assignments",

                error:
                    error.message

            });

        }

    }
);


 // CREATE ASSIGNMENT
 
app.post(
    "/api/assignments",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),
    async (req, res) => {

        try {

            const {
                baseId,
                equipmentTypeId,
                personnelName,
                quantity
            } = req.body;


                         // VALIDATION
             
            if (
                !baseId ||
                !equipmentTypeId ||
                !personnelName ||
                !quantity
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Base, equipment type, personnel name and quantity are required"

                });

            }


            if (Number(quantity) <= 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Quantity must be greater than zero"

                });

            }


                         // BASE COMMANDER RESTRICTION
             
            if (
                req.user.role === "BASE_COMMANDER" &&
                Number(baseId) !== Number(req.user.baseId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only assign equipment from your own base"

                });

            }


                         // CHECK BASE
             
            const baseResult = await db.query(
                `
                SELECT id
                FROM bases
                WHERE id = $1
                `,
                [Number(baseId)]
            );


            if (baseResult.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Base not found"

                });

            }


                         // CHECK EQUIPMENT
             
            const equipmentResult = await db.query(
                `
                SELECT id
                FROM equipment_types
                WHERE id = $1
                `,
                [Number(equipmentTypeId)]
            );


            if (equipmentResult.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Equipment type not found"

                });

            }


                         // USER ID
             
            const assignedBy =
                req.user?.id ??
                req.user?.userId ??
                req.user?.user_id ??
                null;


                         // INSERT ASSIGNMENT
             
            const result = await db.query(
                `
                INSERT INTO assignments
                (
                    base_id,
                    equipment_type_id,
                    personnel_name,
                    quantity,
                    assigned_date,
                    assigned_by
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW(),
                    $5
                )

                RETURNING
                    id,
                    base_id,
                    equipment_type_id,
                    personnel_name,
                    quantity,
                    assigned_date,
                    assigned_by
                `,
                [
                    Number(baseId),
                    Number(equipmentTypeId),
                    personnelName.trim(),
                    Number(quantity),
                    assignedBy
                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Equipment assigned successfully",

                assignment:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Create assignment error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to create assignment",

                error:
                    error.message

            });

        }

    }
);


 // ROOT
 
app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Military Asset Management API is running"

        });

    }
);


 // DATABASE HEALTH
 
app.get(
    "/api/health",
    async (req, res) => {

        try {

            const result =
                await db.query(
                    "SELECT NOW()"
                );


            res.json({

                success: true,

                status: "OK",

                database:
                    "Connected",

                time:
                    result.rows[0].now

            });

        } catch (error) {

            console.error(
                "Database error:",
                error
            );


            res.status(500).json({

                success: false,

                status: "ERROR",

                database:
                    "Disconnected",

                error:
                    error.message

            });

        }

    }
);


 // 404 HANDLER
 
app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                `Cannot ${req.method} ${req.originalUrl}`

        });

    }
);


 // GLOBAL ERROR HANDLER
 
app.use(
    (err, req, res, next) => {

        console.error(
            "Server error:",
            err
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error",

            error:
                err.message

        });

    }
);


 // START SERVER
 
app.listen(
    PORT,
    () => {

        console.log(
            "------------------------------------"
        );

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "------------------------------------"
        );

    }
);