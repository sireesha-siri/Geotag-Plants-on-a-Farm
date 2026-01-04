# 🌾 Farm Geotag - Plant Location Tracking System

A production-ready web application that helps farmers visualize their crop locations by uploading geo-tagged plant images and displaying them on an interactive farm map.

![Farm Geotag Banner](https://via.placeholder.com/1200x400/16a34a/ffffff?text=Farm+Geotag)

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

Farm Geotag is an intuitive web application designed for farmers to manage and visualize their crop inventory spatially. The application allows users to upload images with embedded GPS coordinates, automatically extracts location data, and displays plants on an interactive map.

### Key Highlights

- 📸 **Smart Image Upload**: Drag-and-drop interface with batch upload support
- 🗺️ **Interactive Map**: Real-time visualization of plant locations using Leaflet
- 🔄 **Offline Support**: Works seamlessly with localStorage fallback
- ⚡ **Optimized Performance**: Fast loading with lazy loading and caching
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- 🌓 **Dark Mode**: Built-in theme switching

## ✨ Features

### Phase 1: Image Upload & Processing
- Multi-file drag-and-drop upload interface
- Support for JPG, PNG, and HEIC formats
- Real-time upload progress tracking
- Cloudinary integration for image storage
- Batch upload support (multiple images at once)
- Image preview with status indicators

### Phase 2: Location Data Extraction
- Automatic GPS coordinate extraction from images
- Integration with backend API for coordinate processing
- Error handling for images without GPS data
- Display of extracted latitude/longitude

### Phase 3: Farm Visualization
- Interactive map using Leaflet.js
- Custom plant markers with thumbnails
- Popup details for each plant
- Zoom and pan functionality
- Auto-fit bounds to show all plants
- Filter and search capabilities
- Dark/light theme for map tiles

### Phase 4: Data Management
- Save plant data to backend database
- Fetch and display previously saved plants
- Delete plants with confirmation
- Sort plants by date, name, location
- Export data as JSON or CSV
- Data persistence with localStorage fallback

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling

### Map & Visualization
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **Leaflet MarkerCluster** - Marker clustering for performance

### File Handling
- **React Dropzone** - Drag-and-drop file uploads
- **Cloudinary** - Image storage and CDN

### UI Components
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

### Build Tools
- **Vite** - Build tool and dev server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

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

- Node.js (v16 or higher)
- npm or yarn
- Cloudinary account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farm-geotag.git
   cd farm-geotag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
   VITE_USER_EMAIL=your.email@gmail.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# API Configuration
VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
VITE_USER_EMAIL=your.email@gmail.com
```

### Getting Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Go to Dashboard → Settings
3. Copy your **Cloud Name**
4. Go to Upload → Upload Presets
5. Create an unsigned preset (e.g., "farm-geotag")
6. Add the preset name to your `.env`

## 🔌 API Integration

### Backend Endpoints

The application integrates with three main API endpoints:

#### 1. Extract Coordinates
```javascript
POST /extract-latitude-longitude
Body: {
  "emailId": "user@gmail.com",
  "imageName": "plant_image.jpg",
  "imageUrl": "https://cloudinary.com/..."
}
Response: {
  "success": true,
  "data": {
    "imageName": "plant_image.jpg",
    "latitude": 15.96963,
    "longitude": 79.27812
  }
}
```

#### 2. Save Plant Data
```javascript
POST /save-plant-location-data
Body: {
  "emailId": "user@gmail.com",
  "imageName": "plant_image.jpg",
  "imageUrl": "https://cloudinary.com/...",
  "latitude": 15.96963,
  "longitude": 79.27812
}
Response: {
  "success": true,
  "data": { /* plant object */ }
}
```

#### 3. Get Plant Data
```javascript
POST /get-plant-location-data
Body: {
  "emailId": "user@gmail.com"
}
Response: {
  "success": true,
  "count": 3,
  "data": [ /* array of plants */ ]
}
```

## 🏗️ Architecture

### State Management Flow

```
User Action → Component → Redux Action → Redux Reducer → State Update → Component Re-render
                ↓
         API Service → Backend → Response
                ↓
         localStorage (fallback)
```

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── ThemeToggle
│   │   └── Navigation
│   └── Main Content (Routes)
│       ├── ImageUpload
│       │   ├── UploadZone
│       │   └── ImagePreview
│       ├── FarmMap
│       │   ├── Leaflet Map
│       │   └── FilterPanel
│       └── PlantList
│           ├── FilterPanel
│           └── PlantCard
└── ErrorBoundary
```

### Redux Store Structure

```javascript
{
  plants: {
    plants: [],           // Array of plant objects
    loading: false,       // Loading state
    uploadProgress: {},   // Upload progress tracking
    error: null,         // Error messages
    filters: {
      sortBy: 'date',
      searchTerm: ''
    },
    selectedPlant: null
  },
  theme: {
    mode: 'light'        // 'light' or 'dark'
  }
}
```

## ⚡ Performance Optimizations

### 1. Lazy Loading
- Route-based code splitting for FarmMap and ImageUpload
- PlantList loaded eagerly for instant access
- Images lazy loaded with loading indicators

### 2. API Caching
- 2-minute in-memory cache for plant data
- Reduces unnecessary API calls
- Cache invalidation on data changes

### 3. Data Strategy
- Immediate localStorage data display
- Background API sync
- No blocking on API requests

### 4. Image Optimization
- Cloudinary automatic optimization
- Progressive image loading
- Responsive image sizes

### 5. State Management
- Memoized selectors
- Optimized re-renders with useMemo
- Debounced search input

### 6. Bundle Optimization
- Vite for fast builds
- Tree-shaking unused code
- CSS purging in production

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Deploy to GitHub Pages

1. **Update `vite.config.js`**
   ```javascript
   export default defineConfig({
     base: '/farm-geotag/',
     // ... rest of config
   })
   ```

2. **Build and deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## 📸 Screenshots

### Upload Interface
![Upload Interface](https://via.placeholder.com/800x500/16a34a/ffffff?text=Upload+Interface)

### Interactive Map View
![Map View](https://via.placeholder.com/800x500/16a34a/ffffff?text=Interactive+Map)

### Plant List View
![Plant List](https://via.placeholder.com/800x500/16a34a/ffffff?text=Plant+List)

### Mobile Responsive
![Mobile View](https://via.placeholder.com/400x700/16a34a/ffffff?text=Mobile+View)

## 🎯 Challenges & Solutions

### Challenge 1: MarkerClusterGroup Context Error
**Problem**: `react-leaflet-markercluster` throwing "No context provided" error

**Solution**: 
- Removed problematic MarkerClusterGroup wrapper
- Used direct Leaflet markers within MapContainer
- Maintained performance for up to 100 plants

### Challenge 2: Slow Plants Tab Loading
**Problem**: Plants tab showed loading delay when switching

**Solution**:
- Removed lazy loading for PlantList component
- Implemented immediate localStorage data display
- Added background API sync without blocking UI
- Increased API cache duration to 2 minutes

### Challenge 3: API Endpoint Mismatch
**Problem**: Using wrong HTTP method (GET instead of POST)

**Solution**:
- Updated to POST `/get-plant-location-data`
- Added proper request body with emailId
- Mapped API `_id` field to app's `id` field

### Challenge 4: Large Image Upload Performance
**Problem**: Large images causing slow uploads

**Solution**:
- Implemented client-side image compression
- Set max width to 1920px while maintaining aspect ratio
- Reduced quality to 85% for optimal size/quality balance

## 🔮 Future Enhancements

### Planned Features
- [ ] PWA support with offline functionality
- [ ] Plant health status indicators
- [ ] Historical timeline of farm changes
- [ ] Multi-farm support
- [ ] Plant analytics dashboard
- [ ] AI-powered plant identification
- [ ] Weather integration
- [ ] Geofencing for farm boundaries
- [ ] Real-time collaboration
- [ ] Export to various formats (PDF, KML)

### Technical Improvements
- [ ] Add unit tests with Jest
- [ ] Implement E2E tests with Cypress
- [ ] Add TypeScript for type safety
- [ ] Implement virtual scrolling for large lists
- [ ] Add service workers for better caching
- [ ] Optimize bundle size further

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@gmail.com

## 🙏 Acknowledgments

- Challenge provided by AlumnX and FiduraAI
- Leaflet.js for amazing mapping library
- Cloudinary for image hosting
- Sample plant images from challenge repository

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Email: support@alumnx.com

---

**Built with ❤️ for farmers and agriculture technology**#   G e o t a g - P l a n t s - o n - a - F a r m  
 