# Toyota Near-Miss Detection & Road Safety Analytics

## Overview

Toyota Near-Miss Detection & Road Safety Analytics is a road safety platform designed to identify accident-prone locations by analyzing near-miss events. The system visualizes hotspots, severity trends, and accident causes on an interactive dashboard.

Although the architecture supports live Raspberry Pi sensor integration, the hackathon demonstration uses a realistic simulation pipeline. Near-miss events are exported as JSON, uploaded to MongoDB Atlas through a backend API, and continuously fetched by the dashboard every minute to provide a live monitoring experience.

---

# Project Structure

```
Toyota_Hack/
│
├── pi-agent/
│   ├── sensor_reader.py
│   ├── near_miss_rules.py
│   ├── local_queue.py
│   └── uploader.py
│
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── jobs/
│   └── .env
│
├── dashboard/
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
│
└── data/
    ├── events.json
    └── import.js
```

---

# System Architecture

```
Near-Miss Dataset
        │
        ▼
Export to JSON
        │
        ▼
Backend Import API
        │
        ▼
MongoDB Atlas
        │
        ▼
Dashboard
        │
        ├── Refresh every 60 seconds
        ├── Reload latest events
        ├── Update hotspot map
        ├── Update statistics
        └── Update charts
```

---

# Data Flow

### Step 1

Near-miss records are collected from a dataset and exported as a JSON file.

```
events.json
```

---

### Step 2

The backend reads the JSON file and uploads every event into MongoDB Atlas.

```
events.json
      ↓
Import Script
      ↓
Backend API
      ↓
MongoDB Atlas
```

This process can be executed whenever new data becomes available.

---

### Step 3

The dashboard never reads the JSON file directly.

Instead, it requests data from the backend APIs.

Example:

```
GET /api/events

GET /api/hotspots

GET /api/stats
```

---

### Step 4

Every 60 seconds the dashboard automatically refreshes.

```
setInterval(() => {

Load latest events

Load hotspot map

Load statistics

Load charts

}, 60000);
```

The user experiences continuously changing data similar to a live deployment.

---

# Why JSON Instead of Live Sensors?

The complete architecture supports Raspberry Pi sensors.

However, during the hackathon:

* Hardware may not always be available.
* Network connectivity can vary.
* Continuous demonstrations require stable data.

Therefore, historical near-miss events are exported into JSON and uploaded into MongoDB Atlas.

The dashboard periodically reloads data every minute, accurately simulating a real-time monitoring environment.

---

# Technology Stack

## Frontend

* HTML
* CSS
* JavaScript
* Leaflet.js
* Chart.js

---

## Backend

* Node.js
* Express.js
* JWT Authentication
* Node Cron

---

## Database

* MongoDB Atlas
* Mongoose

---

## Simulation

* JSON Dataset
* Automatic Import Script
* Scheduled Dashboard Refresh

---

# Features

* User Authentication
* Interactive Road Map
* Near-Miss Visualization
* Hotspot Detection
* Severity Analytics
* Cause Analytics
* Event Timeline
* MongoDB Atlas Integration
* Automatic Dashboard Refresh Every Minute
* Real-Time Simulation
* Scalable Backend APIs

---

# APIs

## Authentication

```
POST /api/auth/signup

POST /api/auth/login
```

---

## Events

```
GET /api/events

POST /api/events
```

---

## Hotspots

```
GET /api/hotspots
```

---

## Statistics

```
GET /api/stats
```

---

# MongoDB Collection

Example Event

```json
{
  "deviceId": "DEVICE_01",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "severity": "High",
  "cause": "Sudden Braking",
  "sensorData": {
    "distance": 18,
    "speed": 62,
    "vibration": 4.5,
    "light": 82
  },
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

# Dashboard

The dashboard displays:

* Live hotspot map
* Near-miss markers
* Severity distribution
* Cause distribution
* Total events
* Active hotspots
* Recent incidents

All information is fetched directly from MongoDB Atlas through backend APIs.

---

# Future Scope

The architecture is already compatible with live hardware.

In production:

```
Sensors
    ↓
Raspberry Pi
    ↓
Near-Miss Detection
    ↓
Backend API
    ↓
MongoDB Atlas
    ↓
Dashboard
```

The current implementation replaces the Raspberry Pi stream with periodic JSON imports while preserving the same backend and dashboard interfaces, allowing an easy transition to live sensor data in the future.

---

# Conclusion

This project demonstrates a scalable road safety monitoring platform that identifies near-miss hotspots using MongoDB Atlas, Express.js, and a lightweight HTML dashboard. For the hackathon, JSON-based event imports combined with one-minute dashboard refresh intervals provide a realistic real-time experience without requiring permanent sensor connectivity, while keeping the system fully compatible with future Raspberry Pi sensor integration.
