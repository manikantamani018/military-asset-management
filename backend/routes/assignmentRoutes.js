import express from "express";

import {
    createAssignment,
    getAssignments
} from "../controllers/assignmentController.js";

import {
    authenticateToken
} from "../middlewares/authMiddleware.js";

import {
    authorizeRoles
} from "../middlewares/rbacMiddleware.js";


const router = express.Router();


// CREATE ASSIGNMENT

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),
    createAssignment
);


// GET ASSIGNMENTS

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),
    getAssignments
);


export default router;