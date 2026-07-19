// backend/server.js
const express=require('express');
const cors=require('cors');
const path=require('path');
const dotenv=require('dotenv');
const connectDB=require('./config/db');

dotenv.config();
connectDB();

const app=express();

app.use(cors());
app.use(express.json());

// ── API routes ──
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/events',require('./routes/eventRoutes'));
app.use('/api/hotspots',require('./routes/hotspotRoutes'));
app.use('/api/stats',require('./routes/statsRoutes'));

// ── Serve dashboard static files ──
app.use(express.static(path.join(__dirname,'..','dashboard')));

// ── Catch-all: serve dashboard index.html ──
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'..','dashboard','index.html'));
});

require('./jobs/recalculateHotspots').startHotspotJob();

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});