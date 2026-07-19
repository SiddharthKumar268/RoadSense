// backend/server.js
const express=require('express');
const dotenv=require('dotenv');
const connectDB=require('./config/db');

dotenv.config();
connectDB();

const app=express();

// ── Manual CORS middleware (Express 5 compatible) ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Immediately respond to preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

app.get('/',(req,res)=>{
  res.send('Near-Miss Tracker API is running');
});

app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/events',require('./routes/eventRoutes'));
app.use('/api/hotspots',require('./routes/hotspotRoutes'));
app.use('/api/stats',require('./routes/statsRoutes'));

require('./jobs/recalculateHotspots').startHotspotJob();

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});