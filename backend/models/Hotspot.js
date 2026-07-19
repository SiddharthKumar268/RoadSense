const mongoose=require('mongoose');

const hotspotSchema=new mongoose.Schema({
  latitude:{type:Number,required:true},
  longitude:{type:Number,required:true},
  score:{type:Number,default:0},
  eventCount:{type:Number,default:0},
  lastUpdated:{type:Date,default:Date.now}
});

module.exports=mongoose.model('Hotspot',hotspotSchema);