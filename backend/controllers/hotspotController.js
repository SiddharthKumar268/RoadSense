// backend/controllers/hotspotController.js
const Hotspot=require('../models/Hotspot');
const{recalculateHotspots}=require('../jobs/recalculateHotspots');

exports.getHotspots=async(req,res)=>{
  try{
    const hotspots=await Hotspot.find().sort({score:-1});
    res.json(hotspots);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

exports.refreshHotspots=async(req,res)=>{
  try{
    await recalculateHotspots();
    res.json({message:'Hotspots refreshed'});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};