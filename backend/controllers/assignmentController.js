import db from "../config/db.js";

// CREATE ASSIGNMENT

export const createAssignment = async (req, res) => {
    let client;

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
                    "baseId, equipmentTypeId, personnelName and quantity are required"
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
            Number(baseId) !==
            Number(req.user.baseId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only assign assets for your assigned base"
            });
        }

        client = await db.connect();

        try {
            await client.query("BEGIN");

            // CHECK BASE

            const baseResult = await client.query(
                `
                SELECT id, name
                FROM bases
                WHERE id = $1
                `,
                [baseId]
            );

            if (baseResult.rows.length === 0) {
                throw new Error("Base not found");
            }

            // CHECK EQUIPMENT

            const equipmentResult =
                await client.query(
                    `
                    SELECT id, name, category
                    FROM equipment_types
                    WHERE id = $1
                    `,
                    [equipmentTypeId]
                );

            if (equipmentResult.rows.length === 0) {
                throw new Error(
                    "Equipment type not found"
                );
            }

            // CREATE ASSIGNMENT

            const assignmentResult =
                await client.query(
                    `
                    INSERT INTO assignments
                    (
                        base_id,
                        equipment_type_id,
                        personnel_name,
                        quantity,
                        assigned_by
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    RETURNING *
                    `,
                    [
                        Number(baseId),
                        Number(equipmentTypeId),
                        personnelName.trim(),
                        Number(quantity),
                        req.user.userId
                    ]
                );

            const assignment =
                assignmentResult.rows[0];

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
                    "ASSIGNMENT",
                    `Assigned ${quantity} units of equipment type ${equipmentTypeId} to ${personnelName} at base ${baseId}`
                ]
            );

            await client.query("COMMIT");

            return res.status(201).json({
                success: true,
                message:
                    "Assignment created successfully",
                assignment
            });

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    } catch (error) {

        console.error(
            "Create assignment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET ASSIGNMENTS

export const getAssignments = async (req, res) => {

    try {

        let query = `
            SELECT
                a.id,
                a.base_id,
                b.name AS base_name,
                a.equipment_type_id,
                e.name AS equipment_name,
                e.category,
                a.personnel_name,
                a.quantity,
                a.assigned_date
            FROM assignments a
            JOIN bases b
                ON b.id = a.base_id
            JOIN equipment_types e
                ON e.id = a.equipment_type_id
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
                AND a.base_id =
                $${params.length}
            `;
        }

        query += `
            ORDER BY
            a.assigned_date DESC
        `;

        const result =
            await db.query(
                query,
                params
            );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            assignments: result.rows
        });

    } catch (error) {

        console.error(
            "Get assignments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};