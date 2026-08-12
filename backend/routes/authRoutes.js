import express from "express";

import {
    registerUser,
    loginUser,
    getCurrentUser
} from "../controllers/authController.js";

import {
    authenticateToken
} from "../middlewares/authMiddleware.js";

import {
    authorizeRoles
} from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post(
    "/register",
    authenticateToken,
    authorizeRoles("ADMIN"),
    registerUser
);

router.post(
    "/login",
    loginUser
);

router.get(
    "/me",
    authenticateToken,
    getCurrentUser
);

export default router;