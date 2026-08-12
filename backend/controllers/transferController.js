import db from "../config/db.js";

// CREATE TRANSFER

export const createTransfer = async (req, res) => {
    let client;

    try {
        const {
            sourceBaseId,
            destinationBaseId,
            equipmentTypeId,
            quantity
        } = req.body;

        // VALIDATION

        if (
            !sourceBaseId ||
            !destinationBaseId ||
            !equipmentTypeId ||
            !quantity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "sourceBaseId, destinationBaseId, equipmentTypeId and quantity are required"
            });
        }

        if (
            Number(sourceBaseId) ===
            Number(destinationBaseId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Source base and destination base cannot be the same"
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
            Number(sourceBaseId) !==
            Number(req.user.baseId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only transfer assets from your assigned base"
            });
        }

        // DATABASE CONNECTION

        client = await db.connect();

        try {
            await client.query("BEGIN");

            // CHECK SOURCE BASE

            const sourceBase = await client.query(
                `
                SELECT id, name
                FROM bases
                WHERE id = $1
                `,
                [sourceBaseId]
            );

            if (sourceBase.rows.length === 0) {
                throw new Error("Source base not found");
            }

            // CHECK DESTINATION BASE

            const destinationBase =
                await client.query(
                    `
                    SELECT id, name
                    FROM bases
                    WHERE id = $1
                    `,
                    [destinationBaseId]
                );

            if (destinationBase.rows.length === 0) {
                throw new Error(
                    "Destination base not found"
                );
            }

            // CHECK EQUIPMENT

            const equipment =
                await client.query(
                    `
                    SELECT id, name, category
                    FROM equipment_types
                    WHERE id = $1
                    `,
                    [equipmentTypeId]
                );

            if (equipment.rows.length === 0) {
                throw new Error(
                    "Equipment type not found"
                );
            }

            // CREATE TRANSFER

            const transferResult =
                await client.query(
                    `
                    INSERT INTO transfers
                    (
                        source_base_id,
                        destination_base_id,
                        equipment_type_id,
                        quantity,
                        status,
                        initiated_by
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        'COMPLETED',
                        $5
                    )
                    RETURNING *
                    `,
                    [
                        Number(sourceBaseId),
                        Number(destinationBaseId),
                        Number(equipmentTypeId),
                        Number(quantity),
                        req.user.userId
                    ]
                );

            const transfer =
                transferResult.rows[0];

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
                    "TRANSFER",
                    `Transferred ${quantity} units of equipment type ${equipmentTypeId} from base ${sourceBaseId} to base ${destinationBaseId}`
                ]
            );

            // COMMIT

            await client.query("COMMIT");

            return res.status(201).json({
                success: true,
                message:
                    "Transfer created successfully",
                transfer
            });

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    } catch (error) {

        console.error(
            "Create transfer error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET TRANSFERS

export const getTransfers = async (req, res) => {

    try {

        const {
            status,
            equipmentTypeId
        } = req.query;

        let query = `
            SELECT
                t.id,

                t.source_base_id,

                sb.name AS source_base_name,

                t.destination_base_id,

                db.name AS destination_base_name,

                t.equipment_type_id,

                e.name AS equipment_name,

                e.category,

                t.quantity,

                t.status,

                t.timestamp

            FROM transfers t

            JOIN bases sb
                ON sb.id = t.source_base_id

            JOIN bases db
                ON db.id = t.destination_base_id

            JOIN equipment_types e
                ON e.id = t.equipment_type_id

            WHERE 1 = 1
        `;

        const params = [];

        // BASE COMMANDER RESTRICTION

        if (
            req.user.role ===
            "BASE_COMMANDER"
        ) {

            params.push(
                req.user.baseId
            );

            query += `
                AND (
                    t.source_base_id =
                    $${params.length}

                    OR

                    t.destination_base_id =
                    $${params.length}
                )
            `;
        }

        // STATUS FILTER

        if (status) {

            params.push(status);

            query += `
                AND t.status =
                $${params.length}
            `;
        }

        // EQUIPMENT FILTER

        if (equipmentTypeId) {

            params.push(
                Number(equipmentTypeId)
            );

            query += `
                AND t.equipment_type_id =
                $${params.length}
            `;
        }

        // ORDER BY

        query += `
            ORDER BY
            t.timestamp DESC
        `;

        // EXECUTE QUERY

        const result =
            await db.query(
                query,
                params
            );

        return res.status(200).json({

            success: true,

            count:
                result.rows.length,

            transfers:
                result.rows

        });

    } catch (error) {

        console.error(
            "Get transfers error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }
};