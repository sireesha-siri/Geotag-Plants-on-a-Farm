# 🌾 Farm Geotag - Plant Location Tracking System

A production-ready web application that helps farmers visualize their crop locations by uploading geo-tagged plant images and displaying them on an interactive farm map.

## 🌟 Live Demo
[View Live Demo](#) | [Watch Demo Video](#)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Architecture](#architecture)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Challenges & Solutions](#challenges--solutions)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

Farm Geotag is an intuitive web application designed for farmers to manage and visualize their crop inventory spatially. Upload images with GPS data, and see your plants displayed on an interactive map instantly.

### 🌟 Key Highlights

- 📸 **Smart Image Upload** - Drag-and-drop interface with batch upload support
- 🗺️ **Interactive Map** - Real-time visualization using Leaflet
- 🔄 **Offline Support** - Works seamlessly with localStorage fallback
- ⚡ **Optimized Performance** - Fast loading with caching
- 📱 **Mobile Responsive** - Works on all device sizes
- 🌓 **Dark Mode** - Built-in theme switching

---

## ✨ Features

### 📤 Phase 1: Image Upload & Processing

- Multi-file drag-and-drop upload interface
- Support for JPG, PNG, and HEIC formats
- Real-time upload progress tracking
- Cloudinary integration for image storage
- Batch upload support
- Image preview with status indicators

### 🗺️ Phase 2: Location Data Extraction

- Automatic GPS coordinate extraction from images
- Integration with backend API
- Error handling for images without GPS data
- Display of latitude/longitude data

### 🌍 Phase 3: Farm Visualization

- Interactive map using Leaflet.js
- Custom plant markers with thumbnails
- Popup details for each plant
- Zoom and pan functionality
- Auto-fit bounds to show all plants
- Filter and search capabilities
- Dark/light theme for map tiles

### 💾 Phase 4: Data Management

- Save plant data to backend database
- Fetch previously saved plants
- Delete plants with confirmation
- Sort by date, name, location
- Export data as JSON or CSV
- localStorage fallback

---

## 🛠️ Tech Stack

**Frontend Framework**
- React 18.2
- Redux Toolkit
- React Router v6

**UI & Styling**
- Tailwind CSS
- Framer Motion
- Lucide React Icons

**Map Visualization**
- Leaflet
- React Leaflet

**File Handling**
- React Dropzone
- Cloudinary

**Utilities**
- React Toastify
- Axios

**Build Tools**
- Vite
- PostCSS

---

## 📁 Project Structure

```
farm-geotag/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── map/
│   │   │   ├── FarmMap.jsx
│   │   │   └── FilterPanel.jsx
│   │   ├── plants/
│   │   │   ├── PlantCard.jsx
│   │   │   └── PlantList.jsx
│   │   └── upload/
│   │       ├── ImagePreview.jsx
│   │       ├── ImageUpload.jsx
│   │       └── UploadZone.jsx
│   ├── hooks/
│   │   └── useMediaQuery.js
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── plantsSlice.js
│   │   │   └── themeSlice.js
│   │   └── store.js
│   ├── services/
│   │   ├── api.js
│   │   └── cloudinary.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── storage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

```bash
Node.js v16+
npm or yarn
Cloudinary account (free tier)
```

### Installation Steps

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/farm-geotag.git
cd farm-geotag
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
VITE_USER_EMAIL=your.email@gmail.com
```

**4. Start development server**

```bash
npm run dev
```

**5. Open in browser**

```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

---

## 🔐 Environment Setup

### Getting Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Navigate to Dashboard → Settings
3. Copy your **Cloud Name**
4. Go to Upload → Upload Presets
5. Create unsigned preset (name: "farm-geotag")
6. Add credentials to `.env` file

### Environment Variables

```env
# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=farm-geotag

# API
VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
VITE_USER_EMAIL=your.email@gmail.com
```

---

## 🔌 API Integration

### Endpoints Used

**1. Extract Coordinates**

```javascript
POST /extract-latitude-longitude

Request:
{
  "emailId": "user@gmail.com",
  "imageName": "plant.jpg",
  "imageUrl": "https://cloudinary.com/..."
}

Response:
{
  "success": true,
  "data": {
    "latitude": 15.96963,
    "longitude": 79.27812
  }
}
```

**2. Save Plant Data**

```javascript
POST /save-plant-location-data

Request:
{
  "emailId": "user@gmail.com",
  "imageName": "plant.jpg",
  "imageUrl": "https://cloudinary.com/...",
  "latitude": 15.96963,
  "longitude": 79.27812
}
```

**3. Get Plant Data**

```javascript
POST /get-plant-location-data

Request:
{
  "emailId": "user@gmail.com"
}

Response:
{
  "success": true,
  "count": 3,
  "data": [/* plant objects */]
}
```

---

## 🏗️ Architecture

### State Management Flow

```
User Action → Component → Redux Action → Reducer → State Update → Re-render
                ↓
         API Service → Backend → Response
                ↓
         localStorage (fallback)
```

### Redux Store

```javascript
{
  plants: {
    plants: [],
    loading: false,
    filters: { sortBy: 'date', searchTerm: '' }
  },
  theme: {
    mode: 'light'
  }
}
```

---

## ⚡ Performance Optimizations

### Key Optimizations Implemented

**1. Lazy Loading**
- Route-based code splitting
- Image lazy loading
- On-demand component loading

**2. API Caching**
- 2-minute in-memory cache
- Reduced unnecessary API calls
- Cache invalidation on updates

**3. Data Strategy**
- Immediate localStorage display
- Background API sync
- No blocking on requests

**4. Image Optimization**
- Cloudinary automatic optimization
- Progressive loading
- Responsive image sizes

**5. State Management**
- Memoized selectors
- Optimized re-renders
- Debounced search

**6. Bundle Optimization**
- Vite for fast builds
- Tree-shaking
- CSS purging

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

---

## 📸 Screenshots

### Upload Interface
![Upload](https://via.placeholder.com/800x500?text=Add+Your+Screenshot)

### Interactive Map
![Map](https://via.placeholder.com/800x500?text=Add+Your+Screenshot)

### Plant List
![List](https://via.placeholder.com/800x500?text=Add+Your+Screenshot)

---

## 🎯 Challenges & Solutions

### Challenge 1: MarkerClusterGroup Context Error

**Problem:** `react-leaflet-markercluster` throwing context error

**Solution:** 
- Removed problematic MarkerClusterGroup
- Used direct Leaflet markers
- Maintained performance for 100+ plants

### Challenge 2: Slow Plants Tab Loading

**Problem:** Plants tab showed loading delay

**Solution:**
- Removed lazy loading for PlantList
- Implemented immediate localStorage display
- Added background API sync
- Increased API cache to 2 minutes

### Challenge 3: API Endpoint Mismatch

**Problem:** Using wrong HTTP method (GET vs POST)

**Solution:**
- Updated to POST `/get-plant-location-data`
- Added proper request body
- Mapped API `_id` to app's `id`

### Challenge 4: Large Image Uploads

**Problem:** Large images causing slow uploads

**Solution:**
- Client-side image compression
- Max width 1920px
- 85% quality for optimal balance

---

## 🔮 Future Enhancements

- [ ] PWA with offline functionality
- [ ] Plant health indicators
- [ ] Historical timeline
- [ ] Multi-farm support
- [ ] Analytics dashboard
- [ ] AI plant identification
- [ ] Weather integration
- [ ] Geofencing
- [ ] Real-time collaboration
- [ ] Advanced export options

---

## 📝 License

MIT License

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@gmail.com

## 🙏 Acknowledgments

- Challenge by AlumnX and FiduraAI
- Leaflet.js for mapping
- Cloudinary for image hosting

---

**Built with ❤️ for farmers and agriculture technology**