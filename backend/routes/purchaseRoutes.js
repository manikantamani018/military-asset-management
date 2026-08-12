import express from "express";

import {
    createPurchase,
    getPurchases
} from "../controllers/purchaseController.js";

import {
    authenticateToken
} from "../middlewares/authMiddleware.js";

import {
    authorizeRoles
} from "../middlewares/rbacMiddleware.js";


const router = express.Router();


// CREATE PURCHASE

router.post(
    "/",
    authenticateToken,

    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),

    createPurchase
);


// GET PURCHASE HISTORY

router.get(
    "/",
    authenticateToken,

    authorizeRoles(
        "ADMIN",
        "BASE_COMMANDER",
        "LOGISTICS_OFFICER"
    ),

    getPurchases
);


export default router;