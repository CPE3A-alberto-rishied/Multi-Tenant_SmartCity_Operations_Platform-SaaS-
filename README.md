# 🚨 BEAT: Smart City Command & Public Alert System

## 📖 Project Overview
**BEAT** is a centralized, multi-department crisis management and public reporting web platform tailored for Pasig City. It bridges the gap between citizens and local government units—specifically the **Traffic Department** and **DRRMO (Disaster Risk Reduction and Management Office)**—through real-time incident tracking, advanced geospatial mapping, and automated public alerts.

The system is designed to streamline emergency responses: citizens file public reports, the system routes them to the appropriate department, responders resolve the incidents, and the platform automatically broadcasts the resolution to a live public news feed.

## ✨ Key Features

### 🏢 Multi-Department Architecture
* **Role-Based Access Control:** Distinct workspaces for the **Main Admin**, **Traffic Department**, and **DRRMO**, ensuring secure, siloed operations. 
* **Secure Workflows:** Features JWT/Session-based authentication and OTP (One-Time Password) verification for sensitive profile updates.

### 📢 Integrated Reporting & News Pipeline
* **Public Incident Reporting:** Citizens can file structured reports for vehicular accidents, illegal parking, flooding, fires, and chemical spills.
* **Department Forwarding:** Main Admins can triage and forward pending reports directly to the Traffic or DRRMO queues.
* **Automated Announcements:** When a department marks a report as "Resolved," the system automatically drafts a public announcement and allows admins to seamlessly publish it to the live **City News & Alerts** portal.

### 🗺️ Advanced Geospatial Operations (Powered by Mapbox & Turf.js)
* **Interactive Threat Mapping:** Admins can use live drawing tools to map blocked road segments. The system utilizes Turf.js to automatically calculate and generate polygonal exclusion zones around hazards.
* **Live Global Sync:** Custom hazard zones drawn by individual departments (like DRRMO flood zones) are instantly broadcasted and synced to the Main Admin's master map for city-wide visibility.
* **Evacuation Routing:** Dedicated dashboards to monitor active evacuation centers (e.g., Santolan Elementary, Rosario Sports Complex), track real-time capacity, and plot secure citizen routing.
* **Data Overlays:** Toggleable visual layers including **Accident Heatmaps**, **Weather/AQI Density**, and **Live Traffic Congestion**.

### 📊 Analytics & Live Monitoring
* **Real-Time Dashboards:** Track active operations, pending approvals, and active staff across all 30 barangays in Pasig City.
* **Interactive Data Visualization:** Embedded `Chart.js` integrations to visualize historical accident density, weekly report frequencies, and live traffic congestion indexes (C5 North, EDSA South, Ortigas Ave).

## 🛠️ Tech Stack
* **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (Custom Dark Theme UI)
* **Icons & Assets:** Lucide Icons
* **Mapping & GIS:** Mapbox GL JS, Mapbox GL Draw, Turf.js
* **Data Visualization:** Chart.js
* **Backend API integration:** Node.js / Express / MongoDB (Hosted on Render)
* **State Management:** Browser `localStorage` for rapid cross-page state synchronization and session handling.

## 🚀 System Workflows

1. **The Citizen:** Visits the public portal to view live accident heatmaps or submit a hazard report.
2. **The Dispatcher:** The Main Admin reviews the report, assigns it to DRRMO or Traffic, and dispatches field units.
3. **The Operator:** A Traffic/DRRMO admin isolates the hazard by drawing an exclusion zone on the map, syncing the danger zone to the main grid.
4. **The Resolution:** The incident is cleared, the report is marked as "Resolved," and the system automatically generates an official update for the public City News page.

## 🧊 System Architecture
graph TD
    %% Styling
    classDef public fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef portal fill:#0f172a,stroke:#d946ef,stroke-width:2px,color:#fff;
    classDef backend fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef storage fill:#7c2d12,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef external fill:#4c1d95,stroke:#f97316,stroke-width:2px,color:#fff;

    subgraph Client-Side [Frontend Architecture]
        direction TB
        
        subgraph Public [Public Facing]
            PUB[Citizen Portal<br>Home, Maps, Reports, News]:::public
        end

        subgraph Portals [Secure Department Portals]
            ADMIN[Main Admin Center<br>Global Overseer]:::portal
            TRAFFIC[Traffic Department<br>Congestion &amp; Heatmaps]:::portal
            DRRMO[DRRMO Department<br>Evacuation &amp; Weather]:::portal
        end

        LS[(Browser LocalStorage<br>Live State Sync)]:::storage
    end

    subgraph Server-Side [Backend Infrastructure]
        API[Node.js &amp; Express API<br>Hosted on Render]:::backend
        DB[(MongoDB<br>Cloud Database)]:::backend
    end

    subgraph Third-Party [External Services]
        MAP[Mapbox GL JS &amp; Turf.js<br>Geospatial Engine]:::external
        CHART[Chart.js<br>Data Analytics]:::external
    end

    %% User Interactions
    PUB --&gt;|Submits Emergency Reports| API
    PUB -.-&gt;|Reads Live News| LS

    %% Secure API Calls
    ADMIN &lt;--&gt;|Manage Users &amp; Triage Reports| API
    TRAFFIC &lt;--&gt;|Update Hazard Status| API
    DRRMO &lt;--&gt;|Update Evacuation Status| API
    API &lt;--&gt;|CRUD Operations| DB

    %% Cross-Tab State Syncing (The Bridge)
    TRAFFIC -.-&gt;|Broadcasts Blocked Roads| LS
    DRRMO -.-&gt;|Broadcasts Danger Zones| LS
    ADMIN -.-&gt;|Reads Live Hazards| LS
    DRRMO -.-&gt;|Publishes Resolved Incidents| LS

    %% External API Routing
    TRAFFIC --&gt;|Renders Maps &amp; Calculates Buffers| MAP
    DRRMO --&gt;|Draws Polygons &amp; Heatmaps| MAP
    ADMIN --&gt;|Displays Global City Map| MAP
    PUB --&gt;|Views Public Layers| MAP
    
    TRAFFIC --&gt;|Renders Congestion Stats| CHART
