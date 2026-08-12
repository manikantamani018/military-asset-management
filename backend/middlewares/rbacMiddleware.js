// Authorize Roles

export const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Authentication required"

            });

        }


        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "Access denied: insufficient authorization level"

            });

        }


        next();

    };

};


// ENFORCE BASE SCOPE

export const enforceBaseScope = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message: "Authentication required"

        });

    }


    // Admin can access every base

    if (req.user.role === "ADMIN") {

        return next();

    }


    // Base Commander must have a base

    if (req.user.role === "BASE_COMMANDER") {

        if (!req.user.baseId) {

            return res.status(403).json({

                success: false,

                message: "User is not assigned to a base"

            });

        }
        req.baseId = req.user.baseId;

    }


    next();

};