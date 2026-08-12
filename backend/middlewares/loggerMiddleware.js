import db from "../config/db.js";


// API LOGGER
export const loggerMiddleware = async (req, res, next) => {

    const startTime = Date.now();


    // Save original end function

    const originalEnd = res.end;


    res.end = async function (...args) {

        const duration = Date.now() - startTime;


        try {

            // Only create audit records for authenticated users

            if (req.user) {

                await db.query(

                    `INSERT INTO audit_logs
                        (user_id, action, details)
                     VALUES
                        ($1, $2, $3)`,

                    [

                        req.user.userId,

                        req.method,

                        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`

                    ]

                );

            }

        } catch (error) {

            console.error(
                "Audit logging error:",
                error.message
            );

        }


        originalEnd.apply(res, args);

    };


    next();

};