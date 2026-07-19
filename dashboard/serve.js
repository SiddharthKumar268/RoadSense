// dashboard/serve.js
const express=require('express');
const path=require('path');

const app=express();

// Serve all static files (css, js, html, images)
app.use(express.static(path.join(__dirname)));

// Explicit routes for all pages
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/dashboard',(req,res)=>{
  res.sendFile(path.join(__dirname,'dashboard.html'));
});

app.get('/register',(req,res)=>{
  res.sendFile(path.join(__dirname,'register.html'));
});

// Catch-all: send back to login
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`Dashboard running on port ${PORT}`);
});