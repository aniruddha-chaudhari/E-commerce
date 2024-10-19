import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { login,signup,logout,refreshtoken,getProfile } from "../controllers/authController.js";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh_token', refreshtoken);
router.get('/profile', protectRoute,getProfile);


export default router;