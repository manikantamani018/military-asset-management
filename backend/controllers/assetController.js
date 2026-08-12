import db from "../config/db.js";

// GET DASHBOARD METRICS


export const getDashboardMetrics = async (req, res) => {
    try {
        const {
            baseId,
            equipmentTypeId,
            startDate,
            endDate
        } = req.query;

                // BASE FILTER

        let selectedBaseId = baseId || null;

        // Base Commander can only see own base
        if (req.user.role === "BASE_COMMANDER") {
            selectedBaseId = req.user.baseId;
        }
        // DATE PARAMETERS
        /*
         * If startDate is provided:
         *
         * Opening Balance =
         * all transactions before startDate
         *
         * Current period =
         * startDate -> endDate
         *
         * If startDate is NOT provided:
         * the complete available history is treated
         * as the current period.
         */

        const params = [
            selectedBaseId,
            equipmentTypeId || null,
            startDate || null,
            endDate || null
        ];

        // DASHBOARD QUERY
        const query = `

            WITH
            opening_purchases AS (

                SELECT
                    COALESCE(SUM(p.quantity), 0) AS quantity

                FROM purchases p

                WHERE
                    $3::timestamp IS NOT NULL

                    AND
                    p.purchase_date < $3::timestamp

                    AND
                    (
                        $1::int IS NULL
                        OR p.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR p.equipment_type_id = $2
                    )
            ),


            opening_transfers_in AS (

                SELECT
                    COALESCE(SUM(t.quantity), 0) AS quantity

                FROM transfers t

                WHERE
                    $3::timestamp IS NOT NULL

                    AND
                    t.timestamp < $3::timestamp

                    AND
                    t.status = 'COMPLETED'

                    AND
                    (
                        $1::int IS NULL
                        OR t.destination_base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR t.equipment_type_id = $2
                    )
            ),


            opening_transfers_out AS (

                SELECT
                    COALESCE(SUM(t.quantity), 0) AS quantity

                FROM transfers t

                WHERE
                    $3::timestamp IS NOT NULL

                    AND
                    t.timestamp < $3::timestamp

                    AND
                    t.status = 'COMPLETED'

                    AND
                    (
                        $1::int IS NULL
                        OR t.source_base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR t.equipment_type_id = $2
                    )
            ),


            opening_assignments AS (

                SELECT
                    COALESCE(SUM(a.quantity), 0) AS quantity

                FROM assignments a

                WHERE
                    $3::timestamp IS NOT NULL

                    AND
                    a.assigned_date < $3::timestamp

                    AND
                    (
                        $1::int IS NULL
                        OR a.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR a.equipment_type_id = $2
                    )
            ),


            opening_expenditures AS (

                SELECT
                    COALESCE(SUM(e.quantity), 0) AS quantity

                FROM expenditures e

                WHERE
                    $3::timestamp IS NOT NULL

                    AND
                    e.expended_date < $3::timestamp

                    AND
                    (
                        $1::int IS NULL
                        OR e.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR e.equipment_type_id = $2
                    )
            ),


            purchases_summary AS (

                SELECT
                    COALESCE(SUM(p.quantity), 0) AS purchases

                FROM purchases p

                WHERE
                    (
                        $1::int IS NULL
                        OR p.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR p.equipment_type_id = $2
                    )

                    AND
                    (
                        $3::timestamp IS NULL
                        OR p.purchase_date >= $3::timestamp
                    )

                    AND
                    (
                        $4::timestamp IS NULL
                        OR p.purchase_date <
                           ($4::date + INTERVAL '1 day')
                    )
            ),


            transfers_in_summary AS (

                SELECT
                    COALESCE(SUM(t.quantity), 0) AS transfers_in

                FROM transfers t

                WHERE
                    t.status = 'COMPLETED'

                    AND
                    (
                        $1::int IS NULL
                        OR t.destination_base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR t.equipment_type_id = $2
                    )

                    AND
                    (
                        $3::timestamp IS NULL
                        OR t.timestamp >= $3::timestamp
                    )

                    AND
                    (
                        $4::timestamp IS NULL
                        OR t.timestamp <
                           ($4::date + INTERVAL '1 day')
                    )
            ),


            transfers_out_summary AS (

                SELECT
                    COALESCE(SUM(t.quantity), 0) AS transfers_out

                FROM transfers t

                WHERE
                    t.status = 'COMPLETED'

                    AND
                    (
                        $1::int IS NULL
                        OR t.source_base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR t.equipment_type_id = $2
                    )

                    AND
                    (
                        $3::timestamp IS NULL
                        OR t.timestamp >= $3::timestamp
                    )

                    AND
                    (
                        $4::timestamp IS NULL
                        OR t.timestamp <
                           ($4::date + INTERVAL '1 day')
                    )
            ),


            assignments_summary AS (

                SELECT
                    COALESCE(SUM(a.quantity), 0) AS assigned

                FROM assignments a

                WHERE
                    (
                        $1::int IS NULL
                        OR a.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR a.equipment_type_id = $2
                    )

                    AND
                    (
                        $3::timestamp IS NULL
                        OR a.assigned_date >= $3::timestamp
                    )

                    AND
                    (
                        $4::timestamp IS NULL
                        OR a.assigned_date <
                           ($4::date + INTERVAL '1 day')
                    )
            ),


            expenditures_summary AS (

                SELECT
                    COALESCE(SUM(e.quantity), 0) AS expended

                FROM expenditures e

                WHERE
                    (
                        $1::int IS NULL
                        OR e.base_id = $1
                    )

                    AND
                    (
                        $2::int IS NULL
                        OR e.equipment_type_id = $2
                    )

                    AND
                    (
                        $3::timestamp IS NULL
                        OR e.expended_date >= $3::timestamp
                    )

                    AND
                    (
                        $4::timestamp IS NULL
                        OR e.expended_date <
                           ($4::date + INTERVAL '1 day')
                    )
            )


            SELECT


                (
                    opening_purchases.quantity

                    +

                    opening_transfers_in.quantity

                    -

                    opening_transfers_out.quantity

                    -

                    opening_assignments.quantity

                    -

                    opening_expenditures.quantity

                ) AS opening_balance,

                purchases_summary.purchases,
                transfers_in_summary.transfers_in,
                transfers_out_summary.transfers_out,
                assignments_summary.assigned,
                expenditures_summary.expended,

                (
                    purchases_summary.purchases

                    +

                    transfers_in_summary.transfers_in

                    -

                    transfers_out_summary.transfers_out

                ) AS net_movement,

                (
                    (
                        opening_purchases.quantity

                        +

                        opening_transfers_in.quantity

                        -

                        opening_transfers_out.quantity

                        -

                        opening_assignments.quantity

                        -

                        opening_expenditures.quantity
                    )

                    +

                    purchases_summary.purchases

                    +

                    transfers_in_summary.transfers_in

                    -

                    transfers_out_summary.transfers_out

                    -

                    assignments_summary.assigned

                    -

                    expenditures_summary.expended

                ) AS closing_balance


            FROM opening_purchases

            CROSS JOIN opening_transfers_in

            CROSS JOIN opening_transfers_out

            CROSS JOIN opening_assignments

            CROSS JOIN opening_expenditures

            CROSS JOIN purchases_summary

            CROSS JOIN transfers_in_summary

            CROSS JOIN transfers_out_summary

            CROSS JOIN assignments_summary

            CROSS JOIN expenditures_summary

        `;

        // EXECUTE QUERY
      

        const result = await db.query(
            query,
            params
        );

        const data = result.rows[0];

        // RESPONSE
  

        res.status(200).json({

            success: true,

            metrics: {

                openingBalance:
                    Number(data.opening_balance),

                purchases:
                    Number(data.purchases),

                transfersIn:
                    Number(data.transfers_in),

                transfersOut:
                    Number(data.transfers_out),

                netMovement:
                    Number(data.net_movement),

                assigned:
                    Number(data.assigned),

                expended:
                    Number(data.expended),

                closingBalance:
                    Number(data.closing_balance)

            }

        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to calculate dashboard metrics",

            error:
                error.message

        });

    }
};


// GET ALL BASES

export const getBases = async (req, res) => {

    try {

        const result = await db.query(`

            SELECT
                id,
                name,
                location

            FROM bases

            ORDER BY name ASC

        `);

        res.status(200).json({

            success: true,

            count:
                result.rows.length,

            bases:
                result.rows

        });

    } catch (error) {

        console.error(
            "Get bases error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch bases",

            error:
                error.message

        });

    }

};

// GET ALL EQUIPMENT TYPES

export const getEquipmentTypes = async (req, res) => {

    try {

        const result = await db.query(`

            SELECT
                id,
                name,
                category

            FROM equipment_types

            ORDER BY name ASC

        `);

        res.status(200).json({

            success: true,

            count:
                result.rows.length,

            equipmentTypes:
                result.rows

        });

    } catch (error) {

        console.error(
            "Get equipment types error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch equipment types",

            error:
                error.message

        });

    }

};


// GET ALL EXPENDITURES

export const getExpenditures = async (req, res) => {

    try {

        const result = await db.query(`

            SELECT

                e.id,

                e.base_id,

                b.name AS base_name,

                e.equipment_type_id,

                et.name AS equipment_name,

                et.category,

                e.quantity,

                e.reason,

                e.expended_date,

                e.recorded_by

            FROM expenditures e

            JOIN bases b
                ON e.base_id = b.id

            JOIN equipment_types et
                ON e.equipment_type_id = et.id

            ORDER BY
                e.expended_date DESC,
                e.id DESC

        `);

        res.status(200).json({

            success: true,

            count:
                result.rows.length,

            expenditures:
                result.rows

        });

    } catch (error) {

        console.error(
            "Get expenditures error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch expenditures",

            error:
                error.message

        });

    }

};


// CREATE EXPENDITURE

export const createExpenditure = async (req, res) => {

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
            Number(baseId) !== Number(req.user.baseId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only manage assets for your assigned base"

            });

        }

        // CHECK BASE

        const baseResult = await db.query(
            `
                SELECT id
                FROM bases
                WHERE id = $1
            `,
            [
                Number(baseId)
            ]
        );

        if (baseResult.rows.length === 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid base"

            });

        }

        // CHECK EQUIPMENT TYPE

        const equipmentResult = await db.query(
            `
                SELECT id
                FROM equipment_types
                WHERE id = $1
            `,
            [
                Number(equipmentTypeId)
            ]
        );

        if (equipmentResult.rows.length === 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid equipment type"

            });

        }

        // USER ID

        const recordedBy =
            req.user?.id ??
            req.user?.userId ??
            req.user?.user_id ??
            null;

        // CREATE EXPENDITURE

        const result = await db.query(
            `
                INSERT INTO expenditures
                (
                    base_id,
                    equipment_type_id,
                    quantity,
                    reason,
                    expended_date,
                    recorded_by
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
                    quantity,
                    reason,
                    expended_date,
                    recorded_by
            `,
            [
                Number(baseId),
                Number(equipmentTypeId),
                Number(quantity),
                reason.trim(),
                recordedBy
            ]
        );

        res.status(201).json({

            success: true,

            message:
                "Expenditure recorded successfully",

            expenditure:
                result.rows[0]

        });

    } catch (error) {

        console.error(
            "Create expenditure error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create expenditure",

            error:
                error.message

        });

    }

};