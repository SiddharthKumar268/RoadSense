// dashboard/js/map.js
let map;
let markersLayer;

function initMap(){
  map=L.map('map').setView([12.972946,79.159634],17); // VIT Vellore campus

  // Satellite hybrid layer (Google) — real satellite imagery with labels
  const satellite=L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',{
    attribution:'&copy; Google Maps',
    maxZoom:20,
    subdomains:['mt0','mt1','mt2','mt3']
  });

  // Dark street layer (CARTO) — alternative option
  const darkStreet=L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
    attribution:'&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains:['a','b','c','d'],
    maxZoom:19
  });

  // Default to satellite view
  satellite.addTo(map);

  // Layer switcher control
  L.control.layers({
    '🛰️ Satellite': satellite,
    '🌑 Dark Street': darkStreet
  },null,{position:'topright',collapsed:false}).addTo(map);

  markersLayer=L.layerGroup().addTo(map);
}

function severityColor(score){
  if(score>=7) return '#f87171';
  if(score>=4) return '#f59e0b';
  return '#34d399';
}

function renderHotspots(hotspots){
  markersLayer.clearLayers();

  hotspots.forEach(h=>{
    const radius=Math.min(30,8+h.eventCount*2);

    L.circleMarker([h.latitude,h.longitude],{
      radius,
      color:severityColor(h.score),
      fillColor:severityColor(h.score),
      fillOpacity:0.5,
      weight:2
    })
    .bindPopup(`<b>Score:</b> ${h.score.toFixed(1)}<br><b>Events:</b> ${h.eventCount}`)
    .addTo(markersLayer);
  });
}