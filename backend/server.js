// backend/server.js
const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB=require('./config/db');

dotenv.config();
connectDB();

const app=express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://roadsense-w3b8.onrender.com'
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Handle preflight for all routes
app.options('*', cors());

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