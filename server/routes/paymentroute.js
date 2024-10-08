import express, { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { createpaymentsession } from "../controllers/paymentcontroller";


const router = Router();

router.post("/create-payment-session", protectRoute,createpaymentsession);

export default router;