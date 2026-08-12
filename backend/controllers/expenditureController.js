import db from "../config/db.js";
// CREATE EXPENDITURE
export const createExpenditure = async (req, res) => {
    let client;

    try {
        const {
            baseId,
            equipmentTypeId,
            quantity,
            reason
        } = req.body;
        // VALIDATION
        if (
            !baseId ||
            !equipmentTypeId ||
            !quantity ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "baseId, equipmentTypeId, quantity and reason are required"
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
                    "You can only record expenditures for your assigned base"
            });
        }

        // DATABASE CONNECTION

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

            // CREATE EXPENDITURE

            const expenditureResult =
                await client.query(
                    `
                    INSERT INTO expenditures
                    (
                        base_id,
                        equipment_type_id,
                        quantity,
                        reason,
                        recorded_by
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
                        Number(quantity),
                        reason.trim(),
                        req.user.userId
                    ]
                );

            const expenditure =
                expenditureResult.rows[0];

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
                    "EXPENDITURE",
                    `Recorded expenditure of ${quantity} units of equipment type ${equipmentTypeId} at base ${baseId}. Reason: ${reason}`
                ]
            );

            // COMMIT

            await client.query("COMMIT");

            return res.status(201).json({
                success: true,
                message:
                    "Expenditure recorded successfully",
                expenditure
            });

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    } catch (error) {

        console.error(
            "Create expenditure error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET EXPENDITURES

export const getExpenditures = async (req, res) => {

    try {

        let query = `
            SELECT
                ex.id,
                ex.base_id,
                b.name AS base_name,
                ex.equipment_type_id,
                e.name AS equipment_name,
                e.category,
                ex.quantity,
                ex.reason,
                ex.expended_date
            FROM expenditures ex
            JOIN bases b
                ON b.id = ex.base_id
            JOIN equipment_types e
                ON e.id = ex.equipment_type_id
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
                AND ex.base_id =
                $${params.length}
            `;
        }

        query += `
            ORDER BY
            ex.expended_date DESC
        `;

        const result =
            await db.query(
                query,
                params
            );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            expenditures: result.rows
        });

    } catch (error) {

        console.error(
            "Get expenditures error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};