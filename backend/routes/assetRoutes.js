import express from "express";

import {
    getDashboardMetrics,
    getBases,
    getEquipmentTypes,
    getExpenditures,
    createExpenditure
} from "../controllers/assetController.js";

import {
    authenticateToken
} from "../middlewares/authMiddleware.js";

const router = express.Router();


// DASHBOARD

router.get(
    "/dashboard",
    authenticateToken,
    getDashboardMetrics
);


// BASES

router.get(
    "/bases",
    authenticateToken,
    getBases
);


// EQUIPMENT TYPES

router.get(
    "/equipment-types",
    authenticateToken,
    getEquipmentTypes
);


// EXPENDITURES

router.get(
    "/expenditures",
    authenticateToken,
    getExpenditures
);


router.post(
    "/expenditures",
    authenticateToken,
    createExpenditure
);


export default router;