import { Router } from "express";
import { getProfile, login, logout, refreshtoken, signup } from "../controllers/authController";
import { protectRoute } from "../middleware/authMiddleware";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh_token', refreshtoken);
router.post('/profile', protectRoute,getProfile);


export default router;