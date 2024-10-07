import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { addToCart, removeAllFromCart, updateQuantity } from "../controllers/cartController";

const router = Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;