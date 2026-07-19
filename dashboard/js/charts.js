// dashboard/js/charts.js
const CHART_COLORS=['#8b5cf6','#34d399','#f59e0b','#f87171','#60a5fa','#a78bfa','#10b981'];

let causeChartInstance=null;
let trendChartInstance=null;
let severityChartInstance=null;
let hourlyChartInstance=null;
let wowChartInstance=null;
let sevTrendChartInstance=null;

function renderCauseChart(data){
  if(causeChartInstance) causeChartInstance.destroy();
  causeChartInstance=new Chart(document.getElementById('causeChart'),{
    type:'doughnut',
    data:{
      labels:data.map(d=>d._id),
      datasets:[{
        data:data.map(d=>d.count),
        backgroundColor:CHART_COLORS,
        borderWidth:1,
        borderColor:'#0d0d18'
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:'#c8c8d0',boxWidth:12}}}
    }
  });
}

function renderTrendChart(data){
  if(trendChartInstance) trendChartInstance.destroy();
  trendChartInstance=new Chart(document.getElementById('trendChart'),{
    type:'line',
    data:{
      labels:data.map(d=>d._id),
      datasets:[{
        label:'Events per day',
        data:data.map(d=>d.count),
        borderColor:'#8b5cf6',
        backgroundColor:'rgba(139,92,246,0.15)',
        borderWidth:2,
        pointRadius:3,
        tension:0.3,
        fill:true
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#c8c8d0'}}},
      scales:{
        x:{ticks:{color:'#6b6b80',maxRotation:60,minRotation:60},grid:{color:'rgba(120,60,255,0.10)'}},
        y:{ticks:{color:'#6b6b80'},grid:{color:'rgba(120,60,255,0.10)'}}
      }
    }
  });
}

function renderSeverityChart(events){
  const buckets={'Low (1-3)':0,'Medium (4-6)':0,'High (7-8)':0,'Critical (9-10)':0};
  events.forEach(e=>{
    if(e.severity<=3) buckets['Low (1-3)']++;
    else if(e.severity<=6) buckets['Medium (4-6)']++;
    else if(e.severity<=8) buckets['High (7-8)']++;
    else buckets['Critical (9-10)']++;
  });

  if(severityChartInstance) severityChartInstance.destroy();
  severityChartInstance=new Chart(document.getElementById('severityChart'),{
    type:'bar',
    data:{
      labels:Object.keys(buckets),
      datasets:[{
        data:Object.values(buckets),
        backgroundColor:['#34d399','#f59e0b','#f87171','#ef4444'],
        borderRadius:6
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:'#c8c8d0'},grid:{display:false}},
        y:{ticks:{color:'#6b6b80'},grid:{color:'rgba(120,60,255,0.10)'}}
      }
    }
  });
}

function renderHourlyChart(events){
  const hourCounts=new Array(24).fill(0);
  events.forEach(e=>{
    const hour=new Date(e.timestamp).getHours();
    hourCounts[hour]++;
  });

  if(hourlyChartInstance) hourlyChartInstance.destroy();
  hourlyChartInstance=new Chart(document.getElementById('hourlyChart'),{
    type:'bar',
    data:{
      labels:hourCounts.map((_,h)=>`${h}:00`),
      datasets:[{
        data:hourCounts,
        backgroundColor:'#60a5fa',
        borderRadius:4
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:'#6b6b80',maxRotation:60,minRotation:60},grid:{display:false}},
        y:{ticks:{color:'#6b6b80'},grid:{color:'rgba(120,60,255,0.10)'}}
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════
// ── NEW ANALYTICS CHARTS ──
// ═══════════════════════════════════════════════════════════

// ── 1. Activity Heatmap (Day × Hour grid) ──
function renderActivityHeatmap(data){
  const canvas=document.getElementById('heatmapCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');

  const dpr=window.devicePixelRatio||1;
  const rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr;
  canvas.height=rect.height*dpr;
  ctx.scale(dpr,dpr);

  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const labelW=40, labelH=22, cellW=Math.floor((rect.width-labelW-10)/24), cellH=Math.floor((rect.height-labelH-10)/7);

  // Find max count for color scaling
  const maxCount=Math.max(1,...data.map(d=>d.count));

  ctx.clearRect(0,0,rect.width,rect.height);

  // Hour labels
  ctx.font='10px Inter, sans-serif';
  ctx.fillStyle='#6b6b80';
  ctx.textAlign='center';
  for(let h=0;h<24;h++){
    if(h%3===0) ctx.fillText(`${h}:00`,labelW+h*cellW+cellW/2,rect.height-4);
  }

  // Day labels + cells
  days.forEach((day,di)=>{
    ctx.fillStyle='#6b6b80';
    ctx.textAlign='right';
    ctx.font='10px Inter, sans-serif';
    ctx.fillText(day,labelW-6,labelH+di*cellH+cellH/2+3);

    for(let h=0;h<24;h++){
      const entry=data.find(d=>d._id.day===(di+1)&&d._id.hour===h);
      const count=entry?entry.count:0;
      const intensity=count/maxCount;

      // Color: from dark bg → purple → hot red
      let r,g,b;
      if(intensity===0){ r=13;g=13;b=24; }
      else if(intensity<0.3){ r=Math.round(50+intensity*200);g=Math.round(20+intensity*50);b=Math.round(120+intensity*200); }
      else if(intensity<0.7){ r=Math.round(139+intensity*80);g=Math.round(92-intensity*60);b=Math.round(246-intensity*100); }
      else { r=Math.round(200+intensity*55);g=Math.round(60-intensity*40);b=Math.round(100-intensity*60); }

      const x=labelW+h*cellW;
      const y=di*cellH;

      ctx.fillStyle=`rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.roundRect(x+1,y+1,cellW-2,cellH-2,3);
      ctx.fill();

      // Show count in hot cells
      if(count>0 && cellW>18){
        ctx.fillStyle=intensity>0.5?'#fff':'#9a9ab0';
        ctx.textAlign='center';
        ctx.font=`${intensity>0.5?'bold ':''}9px JetBrains Mono, monospace`;
        ctx.fillText(count,x+cellW/2,y+cellH/2+3);
      }
    }
  });
}

// ── 2. Week-over-Week Comparison ──
function renderWeekOverWeek(data){
  const container=document.getElementById('wowContainer');
  if(!container) return;

  // Render stat summary
  const badge=document.getElementById('wowBadge');
  if(badge){
    const pct=data.changePercent;
    const isUp=pct>0;
    badge.innerHTML=`<span style="color:${isUp?'#f87171':'#34d399'};font-weight:700;">${isUp?'▲':'▼'} ${Math.abs(pct)}%</span> <span style="color:#6b6b80;font-size:11px;">${isUp?'more':'fewer'} events</span>`;
  }

  const dayLabels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const thisWeekData=new Array(7).fill(0);
  const lastWeekData=new Array(7).fill(0);

  data.thisWeek.forEach(d=>{ thisWeekData[d._id-1]=d.count; });
  data.lastWeek.forEach(d=>{ lastWeekData[d._id-1]=d.count; });

  if(wowChartInstance) wowChartInstance.destroy();
  wowChartInstance=new Chart(document.getElementById('wowChart'),{
    type:'bar',
    data:{
      labels:dayLabels,
      datasets:[
        {
          label:'This Week',
          data:thisWeekData,
          backgroundColor:'rgba(139,92,246,0.7)',
          borderRadius:6,
          borderSkipped:false
        },
        {
          label:'Last Week',
          data:lastWeekData,
          backgroundColor:'rgba(96,165,250,0.35)',
          borderRadius:6,
          borderSkipped:false
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:'#c8c8d0',boxWidth:12,usePointStyle:true}}
      },
      scales:{
        x:{ticks:{color:'#c8c8d0'},grid:{display:false}},
        y:{ticks:{color:'#6b6b80'},grid:{color:'rgba(120,60,255,0.10)'}}
      }
    }
  });
}

// ── 3. Safety Score Gauge ──
function renderSafetyGauge(data){
  const el=document.getElementById('safetyGauge');
  if(!el) return;

  const score=data.score;
  const rating=data.rating;

  // Color based on score
  let color='#ef4444';
  if(score>=85) color='#34d399';
  else if(score>=70) color='#10b981';
  else if(score>=50) color='#f59e0b';
  else if(score>=30) color='#f97316';

  const circumference=2*Math.PI*54;
  const offset=circumference-(score/100)*circumference;

  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:28px;flex-wrap:wrap;justify-content:center;">
      <div style="position:relative;width:140px;height:140px;">
        <svg width="140" height="140" viewBox="0 0 140 140" style="transform:rotate(-90deg);">
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
          <circle cx="70" cy="70" r="54" fill="none" stroke="${color}" stroke-width="10"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" style="transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 0 8px ${color}55);"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:36px;font-weight:800;color:${color};font-family:'JetBrains Mono',monospace;line-height:1;">${score}</span>
          <span style="font-size:10px;color:#6b6b80;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">${rating}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;font-size:12px;">
        <div>
          <div style="color:#6b6b80;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">Events/Day</div>
          <div style="color:#c8c8d0;font-weight:600;font-size:16px;font-family:'JetBrains Mono',monospace;">${data.eventFrequency}</div>
        </div>
        <div>
          <div style="color:#6b6b80;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">Avg Severity</div>
          <div style="color:#c8c8d0;font-weight:600;font-size:16px;font-family:'JetBrains Mono',monospace;">${data.avgSeverity}</div>
        </div>
        <div>
          <div style="color:#6b6b80;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">High Sev %</div>
          <div style="color:${data.highSeverityRatio>40?'#f87171':'#c8c8d0'};font-weight:600;font-size:16px;font-family:'JetBrains Mono',monospace;">${data.highSeverityRatio}%</div>
        </div>
        <div>
          <div style="color:#6b6b80;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">30d Events</div>
          <div style="color:#c8c8d0;font-weight:600;font-size:16px;font-family:'JetBrains Mono',monospace;">${data.totalEvents}</div>
        </div>
      </div>
    </div>
  `;
}

// ── 4. Device Activity Table ──
function renderDeviceTable(devices){
  const body=document.getElementById('deviceBody');
  if(!body) return;

  body.innerHTML=devices.map(d=>{
    const sevColor=d.avgSeverity>=7?'#f87171':d.avgSeverity>=4?'#f59e0b':'#34d399';
    const ago=timeSince(new Date(d.lastEvent));
    return `
      <tr>
        <td><span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 6px rgba(52,211,153,.5);"></span>${d.deviceId}</span></td>
        <td style="font-weight:600;">${d.totalEvents}</td>
        <td style="color:${sevColor};font-weight:600;">${d.avgSeverity}</td>
        <td>${d.topCause}</td>
        <td style="color:#6b6b80;font-size:11px;">${ago}</td>
      </tr>`;
  }).join('');
}

function timeSince(date){
  const s=Math.floor((new Date()-date)/1000);
  if(s<60) return s+'s ago';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}

// ── 5. Severity Trend Over Time ──
function renderSeverityTrendChart(data){
  if(sevTrendChartInstance) sevTrendChartInstance.destroy();
  sevTrendChartInstance=new Chart(document.getElementById('sevTrendChart'),{
    type:'line',
    data:{
      labels:data.map(d=>d._id),
      datasets:[
        {
          label:'Avg Severity',
          data:data.map(d=>+d.avgSeverity.toFixed(1)),
          borderColor:'#f59e0b',
          backgroundColor:'rgba(245,158,11,0.10)',
          borderWidth:2.5,
          pointRadius:3,
          tension:0.35,
          fill:true
        },
        {
          label:'Max Severity',
          data:data.map(d=>d.maxSeverity),
          borderColor:'#f8717188',
          borderWidth:1.5,
          pointRadius:2,
          borderDash:[5,4],
          tension:0.35,
          fill:false
        },
        {
          label:'Min Severity',
          data:data.map(d=>d.minSeverity),
          borderColor:'#34d39988',
          borderWidth:1.5,
          pointRadius:2,
          borderDash:[5,4],
          tension:0.35,
          fill:false
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:'#c8c8d0',boxWidth:12,usePointStyle:true}}
      },
      scales:{
        x:{ticks:{color:'#6b6b80',maxRotation:60,minRotation:60},grid:{color:'rgba(120,60,255,0.06)'}},
        y:{
          min:0,max:10,
          ticks:{color:'#6b6b80',stepSize:2},
          grid:{color:'rgba(120,60,255,0.10)'}
        }
      }
    }
  });
}