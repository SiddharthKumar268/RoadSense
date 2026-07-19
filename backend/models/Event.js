const mongoose=require('mongoose');

const eventSchema=new mongoose.Schema({
  location:{
    latitude:{type:Number,required:true},
    longitude:{type:Number,required:true}
  },
  severity:{type:Number,required:true},
  cause:{type:String,required:true},
  sensorData:{type:Object,default:{}},
  deviceId:{type:String,required:true},
  timestamp:{type:Date,default:Date.now}
});

// geospatial index for radius/hotspot queries
eventSchema.index({'location.latitude':1,'location.longitude':1});

module.exports=mongoose.model('Event',eventSchema);