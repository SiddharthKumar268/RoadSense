// backend/seed/seedEvents.js
require('dotenv').config();
const mongoose=require('mongoose');
const Event=require('../models/Event');

const MONGO_URI=process.env.MONGO_URI;

// hotspot zones — each has its own personality (cause bias + risk level)
// replace lat/lng with your real test route coordinates
const ZONES=[
  {name:'Zone 1',lat:12.972946,lng:79.159634,weight:35,riskLevel:'high',biasCauses:['pedestrian_close_pass','two_wheeler_close_pass']},
  {name:'Zone 2',lat:12.971056,lng:79.163528,weight:28,riskLevel:'high',biasCauses:['pedestrian_close_pass','sudden_braking']},
  {name:'Zone 3',lat:12.970583,lng:79.159750,weight:22,riskLevel:'medium',biasCauses:['two_wheeler_close_pass','tailgating']},
  {name:'Zone 4',lat:12.971074,lng:79.166215,weight:18,riskLevel:'medium',biasCauses:['swerve_avoidance','tailgating']},
  {name:'Zone 5',lat:12.971006,lng:79.160696,weight:10,riskLevel:'low',biasCauses:['sudden_braking']}
];

const ALL_CAUSES=['sudden_braking','swerve_avoidance','pedestrian_close_pass','two_wheeler_close_pass','tailgating'];

function jitter(val,spread){ return val+(Math.random()-0.5)*spread; }
function randomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function weightedZone(){
  const total=ZONES.reduce((s,z)=>s+z.weight,0);
  let r=Math.random()*total;
  for(const z of ZONES){
    if(r<z.weight) return z;
    r-=z.weight;
  }
  return ZONES[0];
}

// rush hours get more events — mirrors real traffic patterns
function pickHour(){
  const rushHours=[8,9,18,19,20];
  const useRush=Math.random()<0.55;
  if(useRush) return randomFrom(rushHours);
  return Math.floor(Math.random()*24);
}

function generateEvent(daysAgoMax){
  const zone=weightedZone();

  const riskBoost=zone.riskLevel==='high'?1.3:zone.riskLevel==='medium'?1:0.7;

  const speed=Math.max(6,Math.round(jitter(32,26)*riskBoost));
  const distance=Math.max(5,Math.round(jitter(35,25)/riskBoost));
  const gyroSpike=+(jitter(80,60)*riskBoost).toFixed(1);
  const accelSpike=+(jitter(-0.6,0.5)*riskBoost).toFixed(2);

  const proximityFactor=Math.max(0,(100-distance)/100);
  const speedFactor=Math.min(1,speed/60);
  const reactionFactor=Math.min(1,Math.abs(gyroSpike)/150+Math.abs(accelSpike)/1.2);
  const severity=Math.max(1,Math.min(10,Math.round(proximityFactor*4+speedFactor*3+reactionFactor*3)));

  // cause leans toward the zone's typical cause, occasionally random
  const cause=Math.random()<0.7 ? randomFrom(zone.biasCauses) : randomFrom(ALL_CAUSES);

  const daysAgo=Math.random()*daysAgoMax;
  const hour=pickHour();
  const timestamp=new Date(Date.now()-daysAgo*24*60*60*1000);
  timestamp.setHours(hour,Math.floor(Math.random()*60),0,0);

  return{
    location:{
      latitude:+jitter(zone.lat,0.003).toFixed(6),
      longitude:+jitter(zone.lng,0.003).toFixed(6)
    },
    severity,
    cause,
    sensorData:{
      distanceCm:distance,
      speedKph:speed,
      gyroDegPerSec:gyroSpike,
      accelG:accelSpike
    },
    deviceId:'PI-CAR-01',
    timestamp
  };
}

async function seed(count=400,daysSpread=45){
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Event.deleteMany({deviceId:'PI-CAR-01'});

  const events=Array.from({length:count},()=>generateEvent(daysSpread));
  await Event.insertMany(events);

  console.log(`Seeded ${count} near-miss events across ${daysSpread} days, weighted across ${ZONES.length} zones`);
  await mongoose.disconnect();
}

seed();