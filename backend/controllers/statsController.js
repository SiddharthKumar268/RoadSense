// backend/controllers/statsController.js
const Event=require('../models/Event');

exports.getTotalEvents=async(req,res)=>{
  try{
    const total=await Event.countDocuments();
    res.json({total});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.getHighSeverity=async(req,res)=>{
  try{
    const threshold=Number(req.query.threshold) || 7;
    const count=await Event.countDocuments({severity:{$gte:threshold}});
    res.json({threshold,count});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.getCauseDistribution=async(req,res)=>{
  try{
    const distribution=await Event.aggregate([
      {$group:{_id:'$cause',count:{$sum:1}}},
      {$sort:{count:-1}}
    ]);
    res.json(distribution);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.getDailyTrends=async(req,res)=>{
  try{
    const trends=await Event.aggregate([
      {$group:{
        _id:{$dateToString:{format:'%Y-%m-%d',date:'$timestamp'}},
        count:{$sum:1},
        avgSeverity:{$avg:'$severity'}
      }},
      {$sort:{_id:1}}
    ]);
    res.json(trends);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

// ── NEW: Activity Heatmap (day-of-week × hour) ──
exports.getActivityHeatmap=async(req,res)=>{
  try{
    const heatmap=await Event.aggregate([
      {$project:{
        dayOfWeek:{$dayOfWeek:'$timestamp'},   // 1=Sun … 7=Sat
        hour:{$hour:'$timestamp'},
        severity:1
      }},
      {$group:{
        _id:{day:'$dayOfWeek',hour:'$hour'},
        count:{$sum:1},
        avgSeverity:{$avg:'$severity'}
      }},
      {$sort:{'_id.day':1,'_id.hour':1}}
    ]);
    res.json(heatmap);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

// ── NEW: Week-over-Week Comparison ──
exports.getWeekOverWeek=async(req,res)=>{
  try{
    const now=new Date();
    const startThisWeek=new Date(now);
    startThisWeek.setDate(now.getDate()-now.getDay());
    startThisWeek.setHours(0,0,0,0);

    const startLastWeek=new Date(startThisWeek);
    startLastWeek.setDate(startLastWeek.getDate()-7);

    const [thisWeek,lastWeek]=await Promise.all([
      Event.aggregate([
        {$match:{timestamp:{$gte:startThisWeek}}},
        {$group:{
          _id:{$dayOfWeek:'$timestamp'},
          count:{$sum:1},
          avgSeverity:{$avg:'$severity'}
        }},
        {$sort:{_id:1}}
      ]),
      Event.aggregate([
        {$match:{timestamp:{$gte:startLastWeek,$lt:startThisWeek}}},
        {$group:{
          _id:{$dayOfWeek:'$timestamp'},
          count:{$sum:1},
          avgSeverity:{$avg:'$severity'}
        }},
        {$sort:{_id:1}}
      ])
    ]);

    const thisWeekTotal=thisWeek.reduce((s,d)=>s+d.count,0);
    const lastWeekTotal=lastWeek.reduce((s,d)=>s+d.count,0);
    const changePercent=lastWeekTotal===0 ? 100 : ((thisWeekTotal-lastWeekTotal)/lastWeekTotal*100);

    res.json({thisWeek,lastWeek,thisWeekTotal,lastWeekTotal,changePercent:Math.round(changePercent)});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

// ── NEW: Safety Score (0-100, higher = safer) ──
exports.getSafetyScore=async(req,res)=>{
  try{
    const now=new Date();
    const thirtyDaysAgo=new Date(now.getTime()-30*24*60*60*1000);

    const events=await Event.find({timestamp:{$gte:thirtyDaysAgo}});
    const totalEvents=events.length;

    if(totalEvents===0){
      return res.json({score:100,rating:'Excellent',totalEvents:0,avgSeverity:0,highSeverityRatio:0,eventFrequency:0});
    }

    const avgSeverity=events.reduce((s,e)=>s+e.severity,0)/totalEvents;
    const highSevCount=events.filter(e=>e.severity>=7).length;
    const highSeverityRatio=highSevCount/totalEvents;

    // Events per day over last 30 days
    const daySpan=Math.max(1,(now-thirtyDaysAgo)/(1000*60*60*24));
    const eventFrequency=totalEvents/daySpan;

    // Score formula: 100 base, deductions for frequency, severity, high-sev ratio
    let score=100;
    score -= Math.min(30, eventFrequency * 5);          // up to -30 for high frequency
    score -= Math.min(35, avgSeverity * 3.5);            // up to -35 for high avg severity
    score -= Math.min(25, highSeverityRatio * 50);       // up to -25 for high-sev ratio
    score -= Math.min(10, totalEvents * 0.1);            // up to -10 for sheer volume
    score=Math.max(0,Math.min(100,Math.round(score)));

    let rating='Excellent';
    if(score<30) rating='Critical';
    else if(score<50) rating='Poor';
    else if(score<70) rating='Fair';
    else if(score<85) rating='Good';

    res.json({score,rating,totalEvents,avgSeverity:+avgSeverity.toFixed(1),highSeverityRatio:+(highSeverityRatio*100).toFixed(1),eventFrequency:+eventFrequency.toFixed(1)});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

// ── NEW: Device Activity Breakdown ──
exports.getDeviceActivity=async(req,res)=>{
  try{
    const devices=await Event.aggregate([
      {$group:{
        _id:'$deviceId',
        totalEvents:{$sum:1},
        avgSeverity:{$avg:'$severity'},
        maxSeverity:{$max:'$severity'},
        lastEvent:{$max:'$timestamp'},
        causes:{$push:'$cause'}
      }},
      {$sort:{totalEvents:-1}}
    ]);

    // Compute top cause per device
    const result=devices.map(d=>{
      const freq={};
      d.causes.forEach(c=>{freq[c]=(freq[c]||0)+1;});
      const topCause=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
      return{
        deviceId:d._id,
        totalEvents:d.totalEvents,
        avgSeverity:+d.avgSeverity.toFixed(1),
        maxSeverity:d.maxSeverity,
        lastEvent:d.lastEvent,
        topCause:topCause ? topCause[0] : '-'
      };
    });

    res.json(result);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

// ── NEW: Severity Trend Over Time ──
exports.getSeverityTrend=async(req,res)=>{
  try{
    const trend=await Event.aggregate([
      {$group:{
        _id:{$dateToString:{format:'%Y-%m-%d',date:'$timestamp'}},
        avgSeverity:{$avg:'$severity'},
        maxSeverity:{$max:'$severity'},
        minSeverity:{$min:'$severity'},
        count:{$sum:1}
      }},
      {$sort:{_id:1}}
    ]);
    res.json(trend);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};