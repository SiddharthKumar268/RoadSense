// dashboard/js/api.js
// Same domain — just use relative path
const API_BASE = '/api';

function getToken(){
  return localStorage.getItem('token');
}

async function loginUser(email,password){
  const res=await fetch(`${API_BASE}/auth/login`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email,password})
  });
  const data=await res.json();
  if(!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

async function authFetch(path,options={}){
  const res=await fetch(`${API_BASE}${path}`,{
    ...options,
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });
  if(res.status===401){
    localStorage.removeItem('token');
    window.location.href='index.html';
    return;
  }
  const data=await res.json();
  if(!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function getRecentEvents(limit=20){
  return authFetch(`/events/recent?limit=${limit}`);
}

async function getHotspots(){
  return authFetch('/hotspots');
}

async function getStats(){
  const [total,highSeverity,causeDistribution,dailyTrends]=await Promise.all([
    authFetch('/stats/total'),
    authFetch('/stats/high-severity'),
    authFetch('/stats/cause-distribution'),
    authFetch('/stats/daily-trends')
  ]);
  return{total,highSeverity,causeDistribution,dailyTrends};
}

// ── New analytics API functions ──
async function getActivityHeatmap(){
  return authFetch('/stats/activity-heatmap');
}
async function getWeekOverWeek(){
  return authFetch('/stats/week-over-week');
}
async function getSafetyScore(){
  return authFetch('/stats/safety-score');
}
async function getDeviceActivity(){
  return authFetch('/stats/device-activity');
}
async function getSeverityTrend(){
  return authFetch('/stats/severity-trend');
}