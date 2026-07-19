// backend/routes/statsRoutes.js
const express=require('express');
const router=express.Router();
const{getTotalEvents,getHighSeverity,getCauseDistribution,getDailyTrends,getActivityHeatmap,getWeekOverWeek,getSafetyScore,getDeviceActivity,getSeverityTrend}=require('../controllers/statsController');
const{protect}=require('../middleware/auth');

router.get('/total',protect,getTotalEvents);
router.get('/high-severity',protect,getHighSeverity);
router.get('/cause-distribution',protect,getCauseDistribution);
router.get('/daily-trends',protect,getDailyTrends);
router.get('/activity-heatmap',protect,getActivityHeatmap);
router.get('/week-over-week',protect,getWeekOverWeek);
router.get('/safety-score',protect,getSafetyScore);
router.get('/device-activity',protect,getDeviceActivity);
router.get('/severity-trend',protect,getSeverityTrend);

module.exports=router;