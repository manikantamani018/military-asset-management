import db from "../config/db.js";
// CREATE PURCHASE

export const createPurchase = async (req, res) => {

    try {

        const {
            baseId,
            equipmentTypeId,
            quantity
        } = req.body;
        // VALIDATION

        if (
            !baseId ||
            !equipmentTypeId ||
            !quantity
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "baseId, equipmentTypeId and quantity are required"

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
                    "You can only manage assets for your assigned base"

            });

        }
        // DATABASE TRANSACTION

        const client = await db.connect();


        try {

            await client.query("BEGIN");

            // INSERT PURCHASE

            const purchaseResult =
                await client.query(

                    `
                    INSERT INTO purchases
                    (
                        base_id,
                        equipment_type_id,
                        quantity,
                        created_by
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )

                    RETURNING *
                    `,

                    [
                        Number(baseId),
                        Number(equipmentTypeId),
                        Number(quantity),
                        req.user.userId
                    ]

                );


            const purchase =
                purchaseResult.rows[0];


            // AUDIT LOG

            await client.query(

                `
                INSERT INTO audit_logs
                (
                    user_id,
                    action,
                    details
                )

                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,

                [

                    req.user.userId,

                    "PURCHASE",

                    `Purchased ${quantity} units of equipment type ${equipmentTypeId} for base ${baseId}`

                ]

            );


            await client.query("COMMIT");


            res.status(201).json({

                success: true,

                message:
                    "Purchase recorded successfully",

                purchase

            });


        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }


    } catch (error) {

        console.error(
            "Purchase error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create purchase",

            error:
                error.message

        });

    }

};


// GET PURCHASE HISTORY

export const getPurchases = async (req, res) => {

    try {

        const {
            equipmentTypeId,
            startDate,
            endDate
        } = req.query;


        let query = `

            SELECT

                p.id,

                p.base_id,

                b.name AS base_name,

                p.equipment_type_id,

                e.name AS equipment_name,

                e.category,

                p.quantity,

                p.purchase_date,

                p.created_at

            FROM purchases p

            JOIN bases b
                ON b.id = p.base_id

            JOIN equipment_types e
                ON e.id = p.equipment_type_id

            WHERE 1 = 1

        `;


        const params = [];


        // BASE COMMANDER RESTRICTION

        if (
            req.user.role === "BASE_COMMANDER"
        ) {

            params.push(req.user.baseId);

            query +=
                ` AND p.base_id = $${params.length}`;

        }


        // EQUIPMENT FILTER
        if (equipmentTypeId) {

            params.push(equipmentTypeId);

            query +=
                ` AND p.equipment_type_id = $${params.length}`;

        }


        // START DATE

        if (startDate) {

            params.push(startDate);

            query +=
                ` AND p.purchase_date >= $${params.length}`;

        }

        // END DATE

        if (endDate) {

            params.push(endDate);

            query +=
                ` AND p.purchase_date <= $${params.length}`;

        }


        query += `

            ORDER BY
                p.purchase_date DESC

        `;


        const result =
            await db.query(
                query,
                params
            );


        res.status(200).json({

            success: true,

            count:
                result.rows.length,

            purchases:
                result.rows

        });


    } catch (error) {

        console.error(
            "Get purchases error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch purchases",

            error:
                error.message

        });

    }

};