import express from 'express';
import { createProduct, deleteProduct, getAllproducts, getfeaturedProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from '../controllers/productController.js';
import { AdminRoute, protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',protectRoute,AdminRoute,getAllproducts);
router.get('/featured',getfeaturedProducts);
router.get('/recommendations',getRecommendedProducts);
router.get('/category/:category',getProductsByCategory);
router.patch('/:id',protectRoute,AdminRoute,toggleFeaturedProduct);
router.post('/',protectRoute,AdminRoute,createProduct);
router.delete('/:id',protectRoute,AdminRoute,deleteProduct);

export default router;