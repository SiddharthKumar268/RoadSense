// backend/routes/hotspotRoutes.js
const express=require('express');
const router=express.Router();
const{getHotspots,refreshHotspots}=require('../controllers/hotspotController');
const{protect}=require('../middleware/auth');

router.get('/',protect,getHotspots);
router.post('/refresh',protect,refreshHotspots);

module.exports=router;