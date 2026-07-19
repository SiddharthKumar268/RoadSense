// backend/jobs/recalculateHotspots.js
const cron=require('node-cron');
const Event=require('../models/Event');
const Hotspot=require('../models/Hotspot');

const GRID_SIZE=0.001; // ~100m grid cell

function roundToGrid(value){
  return Math.round(value/GRID_SIZE)*GRID_SIZE;
}

async function recalculateHotspots(){
  const events=await Event.find();
  const grid={};

  events.forEach(e=>{
    const lat=roundToGrid(e.location.latitude);
    const lng=roundToGrid(e.location.longitude);
    const key=`${lat}_${lng}`;

    if(!grid[key]) grid[key]={latitude:lat,longitude:lng,eventCount:0,severitySum:0};

    grid[key].eventCount+=1;
    grid[key].severitySum+=e.severity;
  });

  const cells=Object.values(grid);

  for(const cell of cells){
    const score=cell.eventCount*(cell.severitySum/cell.eventCount);

    await Hotspot.findOneAndUpdate(
      {latitude:cell.latitude,longitude:cell.longitude},
      {score,eventCount:cell.eventCount,lastUpdated:new Date()},
      {upsert:true}
    );
  }

  console.log(`Hotspots recalculated: ${cells.length} cells`);
}

function startHotspotJob(){
  // runs every hour
  cron.schedule('0 * * * *',recalculateHotspots);
}

module.exports={recalculateHotspots,startHotspotJob};