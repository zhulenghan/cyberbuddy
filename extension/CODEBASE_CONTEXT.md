# Cyber Buddy Extension - AI Context Reference

> Quick reference guide for AI assistants to understand the codebase structure and key components.

---

## 📁 Project Quick Facts

- **Framework**: WXT (Web Extension Toolkit) + React 19 + TypeScript
- **Extension Type**: Chrome MV3
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Radix UI
- **Build Tool**: Vite
- **Backend**: AWS Lambda (REST API)

---

## 🗂️ Directory Structure Quick Map

```
extension/
├── entrypoints/          # Extension entry points
│   ├── background.ts     # ⭐ Background service worker - activity tracking core
│   ├── content.tsx       # ⭐ Content script - pet widget injector
│   └── popup/            # Popup app entry
├── pages/                # ⭐ Main UI pages (routing)
│   ├── Welcome.tsx       # Login page
│   ├── Home.tsx          # Pet collection & selection
│   ├── CreatePet.tsx     # Pet generation
│   ├── FocusReport.tsx   # Analytics dashboard
│   └── Settings.tsx      # User preferences
├── components/           # Reusable UI components
│   ├── pet/PetCard.tsx
│   ├── charts/           # Analytics charts
│   └── ui/               # ShadCN components
├── hooks/                # ⭐ Custom React hooks
│   ├── usePet.ts         # Pet state management
│   ├── useAuth.ts        # Authentication
│   └── useActivityTracker.ts
├── lib/                  # ⭐ Core business logic
│   ├── api/client.ts     # REST API client
│   ├── auth/google-auth.ts  # Google OAuth
│   ├── classifier/       # Page classification engine
│   ├── storage/          # Chrome storage + IndexedDB wrappers
│   ├── store/            # Zustand stores
│   ├── tracker/time-tracker.ts  # Activity tracking
│   └── config.ts         # App configuration
└── shared/               # Shared types & constants (sibling directory)
    ├── types/            # TypeScript types
    └── constants/labels.ts  # Classification patterns
```

---

## 🎯 Core Modules & Their Locations

### 1. Authentication System
**Files:**
- `lib/auth/google-auth.ts` - Google OAuth via `chrome.identity.getAuthToken`
- `lib/store/authStore.ts` - Zustand auth state
- `hooks/useAuth.ts` - Auth hook

**Key Functions:**
- `googleLogin()` - Get Google token + user info
- `authStore.login()` - Exchange token with backend
- `authStore.refreshToken()` - Auto refresh expired tokens

**Storage Keys:**
- `auth:accessToken`, `auth:refreshToken`, `auth:tokenExpiry`, `user:data`

---

### 2. Pet Management System
**Files:**
- `lib/store/petStore.ts` - Zustand pet state
- `hooks/usePet.ts` - Pet management hook
- `pages/CreatePet.tsx` - Pet generation UI
- `pages/Home.tsx` - Pet selection UI

**Key Functions:**
- `petStore.generatePet(prompt)` - Call backend to generate pet
- `petStore.savePet(pet, name)` - Save to IndexedDB + Chrome storage
- `petStore.setCurrentPet(pet)` - Switch active pet
- `petStore.deletePet(id)` - Remove pet

**Pet States:** idle, happy, focused, tired, excited

**Storage:**
- Chrome Storage: `pet:current` (current pet object)
- IndexedDB: `pets` table (all pets)

---

### 3. Activity Tracking System
**Files:**
- `entrypoints/background.ts` - Tab monitoring & tracking logic
- `lib/tracker/time-tracker.ts` - Time tracking engine
- `lib/classifier/index.ts` - Page classification orchestrator
- `lib/classifier/strategies.ts` - URL/keyword classification

**Flow:**
```
Tab change → Extract URL/title → Classify page → Determine pet state →
Log activity → Update IndexedDB → Broadcast state to content scripts
```

**Key Events:**
- `chrome.tabs.onActivated` - Tab switch
- `chrome.tabs.onUpdated` - URL change
- `chrome.idle.onStateChanged` - Idle detection (60s threshold)

**Classification Labels:**
- `focused` - Work/study sites
- `entertainment` - YouTube, Netflix, etc.
- `social` - Social media
- `shopping` - E-commerce
- `other` - Uncategorized

**Storage:**
- IndexedDB: `activities` table (indexed by date, label, url)

---

### 4. Page Classifier
**Files:**
- `lib/classifier/strategies.ts` - Classification strategies
- `shared/constants/labels.ts` - URL patterns & keywords

**Strategies:**
1. **URLPatternStrategy** - Regex matching (fast, 0.9 confidence)
2. **KeywordStrategy** - Content analysis (slower, variable confidence)
3. **CombinedStrategy** - URL first, keyword fallback

**Cache:** 500-entry LRU cache (0.7+ confidence threshold)

**Quick Pattern Examples:**
```typescript
github.com → focused (development)
youtube.com → entertainment
twitter.com → social
amazon.com → shopping
```

---

### 5. Pet Widget (Content Script)
**Files:**
- `entrypoints/content.tsx` - Widget injector
- `entrypoints/content/PetWidget.tsx` - Main widget component
- `entrypoints/content/FocusTimer.tsx` - Pomodoro timer
- `entrypoints/content/ChatBox.tsx` - Pet chat interface

**Features:**
- Draggable floating pet avatar
- State-responsive images (GIF support)
- Click menu: Focus Timer | Chat | Hide
- Shadow DOM for style isolation

**Messages:**
- `SHOW_PET` - Display pet on page
- `HIDE_PET` - Hide pet
- `PET_STATE_CHANGE` - Update pet state

---

### 6. Focus Timer
**Files:**
- `entrypoints/content/FocusTimer.tsx` - Timer UI
- `components/ui/timer.tsx` - Timer component

**Presets:** 15, 25, 45 minutes

**Storage Keys:**
- `timerActive` - Boolean
- `timerStartTime` - Timestamp
- `timerDuration` - Milliseconds

---

## 📊 State Management

### Zustand Stores

#### authStore (`lib/store/authStore.ts`)
```typescript
{
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login(), logout(), refreshToken(), loadSession()
}
```

#### petStore (`lib/store/petStore.ts`)
```typescript
{
  currentPet: Pet | null
  availablePets: Pet[]
  petState: PetState  // idle, happy, focused, etc.
  position: { x, y }

  // Actions
  generatePet(), savePet(), setCurrentPet(), deletePet()
}
```

#### activityStore (`lib/store/activityStore.ts`)
```typescript
{
  currentPage: { url, title, label }
  currentLabel: ActivityLabel
  todayStats: DailyStats

  // Actions
  updateCurrentActivity(), getTodayStats()
}
```

---

## 🔧 Configuration

### Environment Variables (`.env`)
```bash
VITE_API_URL=https://6q6kbdbc5l.execute-api.us-east-1.amazonaws.com/v1
VITE_GOOGLE_CLIENT_ID=1046077390083-te13pjjcagcf94kkdmjrc0odkvnk32e5.apps.googleusercontent.com
```

### Config Constants (`lib/config.ts`)
```typescript
CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID

  STORAGE_KEYS: { ... }

  IDLE_THRESHOLD: 60000  // 1 min
  MIN_ACTIVITY_DURATION: 5000  // 5s
  SYNC_INTERVAL: 300000  // 5 min

  DEFAULT_FOCUS_DURATION: 25  // Pomodoro

  FREE_GENERATIONS_PER_DAY: 5
  MAX_PETS_PER_USER: 10
}
```

---

## 🌐 Backend API Endpoints

**Base URL:** `https://6q6kbdbc5l.execute-api.us-east-1.amazonaws.com/v1`

### Authentication
```
POST /auth/google
  Body: { googleToken: string }
  Response: { user: User, tokens: AuthTokens }

POST /auth/refresh
  Body: { refreshToken: string }
  Response: { accessToken: string, expiresIn: number }

POST /auth/logout
```

### Pets
```
POST /pets
  Body: { prompt: string, style: 'pixel' | '3d' }
  Response: Pet

POST /pets/{petId}/behavior
  Response: { behaviorContent: PetBehaviorContent }

DELETE /pets/{petId}

GET /pets
  Response: Pet[]
```

### Activities
```
POST /activities
  Body: { url, title, label, duration, startTime, endTime }

GET /activities?startDate=...&endDate=...
  Response: Activity[]

GET /reports/daily
GET /reports/weekly
```

---

## 💾 Storage Architecture

### Chrome Storage (chrome.storage.local)
**Size Limit:** ~5MB
**Use:** Small key-value data

**Keys:**
- `auth:accessToken` - JWT token
- `auth:refreshToken` - Refresh token
- `user:data` - User profile
- `pet:current` - Current pet object
- `pet:position` - Widget position {x, y}
- `user:preferences` - Settings

### IndexedDB
**Size Limit:** ~50MB+ (soft)
**Use:** Large structured data

**Stores:**
1. `activities` - Activity logs
   - Indexes: `date`, `label`, `url`

2. `pets` - Pet collection
   - Index: `id`

3. `images` - Pet images (blobs)
   - Index: `createdAt`

---

## 🎨 UI Component Library

### Custom Components
- `components/pet/PetCard.tsx` - Pet display card
- `components/charts/MonthlyBarChart.tsx` - Activity chart
- `components/charts/WeeklyActivityDots.tsx` - Weekly heatmap
- `components/layout/PixelFooter.tsx` - Retro footer

### ShadCN UI (`components/ui/`)
- `button.tsx`, `input.tsx`, `toast.tsx`
- `carousel.tsx` - Pet carousel
- `timer.tsx` - Focus timer
- `loading.tsx` - Loading states

---

## 🔍 Quick Search Patterns

### Find authentication logic
```
lib/auth/google-auth.ts
lib/store/authStore.ts
```

### Find page classification
```
lib/classifier/
shared/constants/labels.ts
```

### Find pet widget rendering
```
entrypoints/content/PetWidget.tsx
```

### Find activity tracking
```
entrypoints/background.ts (search: onActivated)
lib/tracker/time-tracker.ts
```

### Find API calls
```
lib/api/client.ts (all API logic)
```

### Find storage operations
```
lib/storage/chrome-storage.ts
lib/storage/indexed-db.ts
```

### Find routing
```
entrypoints/popup/App.tsx
```

---

## 🚀 Common Tasks

### Add a new page classification pattern
1. Edit `shared/constants/labels.ts`
2. Add URL regex or keyword to appropriate category
3. Rebuild extension

### Add a new pet state
1. Update `shared/types/pet.ts` - Add to PetState union
2. Update `lib/classifier/` - Add mapping logic
3. Update `entrypoints/content/PetWidget.tsx` - Add image selection logic

### Add a new API endpoint
1. Update `lib/api/client.ts` - Add method
2. Use in relevant store/hook
3. Update types in `shared/types/`

### Debug storage issues
```typescript
// In console
chrome.storage.local.get(null, console.log)

// In code
import { debugAllStorage } from '@/lib/utils/debugStorage'
await debugAllStorage()
```

### Debug pet visibility
```typescript
// Check content script injection
chrome.tabs.query({active: true}, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => console.log(document.querySelector('#cyber-buddy-pet-widget'))
  })
})
```

---

## 📝 TypeScript Types Reference

### Core Types (`shared/types/`)

**Pet:**
```typescript
interface Pet {
  id: string
  userId: string
  name: string
  prompt: string
  images: {
    idle: string
    happy: string
    focused: string
    tired: string
    excited: string
  }
  style: 'pixel' | '3d'
  createdAt: Date
  isActive: boolean
}
```

**Activity:**
```typescript
interface Activity {
  id: string
  userId: string
  url: string
  title: string
  label: ActivityLabel  // 'focused' | 'entertainment' | 'social' | 'shopping' | 'other'
  duration: number
  startTime: Date
  endTime: Date
}
```

**User:**
```typescript
interface User {
  id: string
  email: string
  name: string
  picture: string
  createdAt: Date
}
```

---

## 🛠️ Build Commands

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🐛 Common Issues & Solutions

### Issue: OAuth2 "bad client id" error
**Solution:**
1. Verify `VITE_GOOGLE_CLIENT_ID` in `.env`
2. Check Google Cloud Console: Add extension ID to authorized origins
3. Extension ID format: `chrome-extension://[YOUR_ID]`

### Issue: Pet widget not showing
**Causes:**
1. Content script not injected → Check manifest permissions
2. Pet not selected → Check `chrome.storage.local['pet:current']`
3. CSS conflict → Shadow DOM should prevent this

### Issue: Activity not tracking
**Causes:**
1. Background script not running → Reload extension
2. URL excluded → Check if URL matches chrome://* pattern
3. Idle state active → Wait 60s or trigger tab change

---

## 📦 Dependencies Overview

**Runtime:**
- React 19.1.1
- React Router 7.9.4
- Zustand 5.0.2
- TanStack Query 5.90.2
- Recharts 2.15.4
- Framer Motion 11.15.0
- date-fns 4.1.0

**UI:**
- Tailwind CSS 3.4.17
- Radix UI components
- Lucide React (icons)

**Build:**
- WXT 0.20.6
- Vite (bundled with WXT)
- TypeScript 5.9.2

---

## 🔗 Key File Relationships

```
Background Script ←→ Content Script
       ↓                    ↓
   TimeTracker         PetWidget
       ↓                    ↓
   Classifier          FocusTimer
       ↓                    ↓
   IndexedDB          ChromeStorage
       ↑                    ↑
    Popup App         All Components
```

---

## 📋 Quick Checklist for Understanding New Features

When analyzing a feature request:

1. ✅ Which module? (Auth, Pet, Activity, UI)
2. ✅ Where does it run? (Background, Content, Popup)
3. ✅ What data? (Check types in `shared/types/`)
4. ✅ Where stored? (Chrome Storage, IndexedDB, Backend)
5. ✅ API needed? (Check `lib/api/client.ts`)
6. ✅ State management? (Which Zustand store)
7. ✅ UI location? (Which page/component)

---

**Last Updated:** 2025-10-23
**Extension Version:** 0.1.0
