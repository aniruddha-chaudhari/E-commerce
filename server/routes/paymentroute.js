import express from 'express';
import { protectRoute } from "../middleware/authMiddleware.js";
import { createpaymentsession } from "../controllers/paymentcontroller.js";


const router = express.Router();

router.post("/create-payment-session", protectRoute,createpaymentsession);

export default router;