// backend/controllers/eventController.js
const Event=require('../models/Event');

exports.createEvent=async(req,res)=>{
  try{
    const{location,severity,cause,sensorData,deviceId,timestamp}=req.body;

    const event=await Event.create({location,severity,cause,sensorData,deviceId,timestamp});

    res.status(201).json(event);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.getEvents=async(req,res)=>{
  try{
    const{cause,minSeverity,from,to}=req.query;
    const filter={};

    if(cause) filter.cause=cause;
    if(minSeverity) filter.severity={$gte:Number(minSeverity)};
    if(from || to){
      filter.timestamp={};
      if(from) filter.timestamp.$gte=new Date(from);
      if(to) filter.timestamp.$lte=new Date(to);
    }

    const events=await Event.find(filter).sort({timestamp:-1});
    res.json(events);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.getRecentEvents=async(req,res)=>{
  try{
    const limit=Number(req.query.limit) || 20;
    const events=await Event.find().sort({timestamp:-1}).limit(limit);
    res.json(events);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};