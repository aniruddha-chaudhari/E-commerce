import { Router } from "express";
import { login, logout, refreshtoken, signup } from "../controllers/authController";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh_token', refreshtoken);


export default router;