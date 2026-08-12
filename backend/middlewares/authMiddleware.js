import jwt from "jsonwebtoken";

// AUTHENTICATE TOKEN

export const authenticateToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        // Authorization header must exist

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Access token required"

            });

        }
        // Bearer TOKEN

        const parts = authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format"

            });

        }


        const token = parts[1];


        // Verify token

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );


        // Store user information in request

        req.user = decoded;


        next();


    } catch (error) {

        console.error("Authentication error:", error.message);


        if (error.name === "TokenExpiredError") {

            return res.status(401).json({

                success: false,

                message: "Token has expired"

            });

        }


        return res.status(401).json({

            success: false,

            message: "Invalid token"

        });

    }

};