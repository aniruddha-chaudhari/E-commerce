import express from 'express';
import { protectRoute,AdminRoute } from '../middleware/authMiddleware.js';
import { getAnalytics, getDailySalesData } from '../controllers/analyticscontroller.js';

const router = express.Router();

// Define your routes here

router.get('/',protectRoute,AdminRoute,async (req,res) => {
try{const analyticsdata = await getAnalytics();

const endDate = new Date();

const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
const dailysalesdata = await getDailySalesData(startDate, endDate);

res.json({analyticsdata,dailysalesdata});}
catch(error){
console.error(error);
}
});

export default router;