// backend/routes/eventRoutes.js
const express=require('express');
const router=express.Router();
const{createEvent,getEvents,getRecentEvents}=require('../controllers/eventController');
const{protect}=require('../middleware/auth');

router.post('/',createEvent);
router.get('/',protect,getEvents);
router.get('/recent',protect,getRecentEvents);

module.exports=router;