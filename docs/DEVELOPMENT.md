# Cyber Buddy - Development Guide

## 📦 Frontend Implementation Status

### ✅ Completed Components

#### 1. **Project Structure (Monorepo)**
```
cyberbuddy/
├── extension/          # Chrome Extension
├── backend/            # AWS Services (skeleton)
├── shared/             # Shared types & utilities
└── docs/              # Documentation
```

#### 2. **Core Libraries** (`extension/lib/`)
- ✅ **Storage Layer**
  - `chrome-storage.ts` - Chrome Storage API wrapper
  - `indexed-db.ts` - IndexedDB for activities, pets, images

- ✅ **Page Classifier**
  - `strategies.ts` - URL patterns, keywords, combined
  - `index.ts` - Classifier with caching

- ✅ **Time Tracker**
  - `time-tracker.ts` - Activity tracking, daily stats

- ✅ **API Client**
  - `client.ts` - HTTP client with error handling

#### 3. **State Management** (`extension/lib/store/`)
- ✅ `authStore.ts` - Authentication (login, logout, token refresh)
- ✅ `petStore.ts` - Pet management (generate, select, delete)
- ✅ `activityStore.ts` - Activity tracking
- ✅ `settingsStore.ts` - User preferences

#### 4. **React Hooks** (`extension/hooks/`)
- ✅ `useAuth.ts` - Auth hook
- ✅ `usePet.ts` - Pet management hook
- ✅ `useActivityTracker.ts` - Activity tracking hook
- ✅ `useSettings.ts` - Settings hook

#### 5. **Extension Entrypoints**
- ✅ **Background Service Worker** (`entrypoints/background.ts`)
  - Tab monitoring
  - Page classification
  - Activity tracking
  - Idle detection
  - Cross-tab state sync

- ✅ **Content Script** (`entrypoints/content.ts`)
  - Pet Widget injection
  - Page content extraction
  - State change listener

- ✅ **Pet Widget** (`entrypoints/content/PetWidget.tsx`)
  - Draggable pet
  - State animations
  - Position persistence

- ✅ **Popup UI** (`entrypoints/popup/App.tsx`)
  - Login screen
  - Activity dashboard
  - Stats display
  - Quick actions

#### 6. **Shared Package** (`shared/`)
- ✅ TypeScript types (Activity, Pet, User, API)
- ✅ Constants (labels, API endpoints, errors)
- ✅ Utilities (validation, date, helpers)

## 🚀 Getting Started

### Installation

```bash
# Install all dependencies
npm install

# Or install per workspace
cd extension && npm install
cd ../shared && npm install
```

### Development

```bash
# Start extension in development mode
npm run dev:extension

# Or from extension directory
cd extension && npm run dev
```

The extension will be loaded in Chrome with hot reload.

### Building

```bash
# Build extension for production
npm run build:extension

# Output: extension/.output/chrome-mv3/
```

### Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/.output/chrome-mv3` directory

## 🔧 Configuration

### Environment Variables

Create `extension/.env`:

```env
VITE_API_URL=http://localhost:3000/v1
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_DEBUG=true
```

### WXT Configuration

See `extension/wxt.config.ts` for manifest and build settings.

## 📝 Key Features Implemented

### 1. **Automatic Page Classification**
- URL pattern matching (fast)
- Keyword analysis (accurate)
- 6 categories: learning, working, entertainment, social, shopping, other

### 2. **Time Tracking**
- Automatic activity logging
- Idle detection (60s threshold)
- Daily statistics
- Top sites tracking

### 3. **Pet System**
- Dynamic state changes based on activity
- Draggable position
- Cross-tab state sync
- 5 states: idle, happy, focused, tired, excited

### 4. **Storage**
- Chrome Storage for small data
- IndexedDB for activities and images
- Offline-first architecture

### 5. **UI Components**
- Popup dashboard
- Activity stats
- Pet Widget overlay

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📦 Project Structure

```
extension/
├── entrypoints/
│   ├── background.ts         # ✅ Service Worker
│   ├── content.ts            # ✅ Content Script
│   ├── content/
│   │   └── PetWidget.tsx     # ✅ Pet Component
│   └── popup/
│       ├── App.tsx           # ✅ Popup UI
│       └── style.css         # ✅ Styles
│
├── lib/                      # ✅ Core libraries
│   ├── api/
│   ├── classifier/
│   ├── storage/
│   ├── store/
│   ├── tracker/
│   └── config.ts
│
├── hooks/                    # ✅ React hooks
│   ├── useAuth.ts
│   ├── usePet.ts
│   ├── useActivityTracker.ts
│   └── useSettings.ts
│
├── components/               # 🔄 To be expanded
├── assets/                   # ✅ Styles
└── public/                   # ✅ Icons
```

## 🔄 Next Steps

### Phase 1: Complete Core Features
- [ ] Implement Google OAuth login
- [ ] Connect to backend API
- [ ] Implement pet image generation
- [ ] Add more UI pages (settings, reports, generator)

### Phase 2: Enhanced UI
- [ ] Pet animation library
- [ ] Report visualization (charts)
- [ ] Onboarding flow
- [ ] Settings page

### Phase 3: Backend Integration
- [ ] AWS CDK infrastructure
- [ ] Lambda functions
- [ ] DynamoDB setup
- [ ] S3 for images

### Phase 4: Polish
- [ ] Error boundaries
- [ ] Loading states
- [ ] Offline support
- [ ] Performance optimization

## 🐛 Known Issues

1. **Pet images**: Currently using placeholder, needs AI generation
2. **Authentication**: Google OAuth not yet implemented
3. **API calls**: Backend not implemented yet
4. **Persistence**: Some state not persisted across browser restarts

## 💡 Development Tips

### Hot Reload
WXT provides hot reload. Changes to `entrypoints/`, `components/`, and `hooks/` will auto-reload.

### Debugging
- Background: Inspect service worker in `chrome://extensions/`
- Content Script: Use browser DevTools on any page
- Popup: Right-click extension icon → Inspect

### TypeScript
Use `@shared/types` for shared types between frontend and backend.

### State Management
Zustand stores are in `lib/store/`. They're lightweight and don't need providers.

## 📚 Resources

- [WXT Documentation](https://wxt.dev/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [Architecture Doc](docs/architecture.md)
- [PRD](docs/PRD.md)

## 🤝 Contributing

1. Create feature branch
2. Implement changes
3. Test locally
4. Submit PR

## 📄 License

Private - All rights reserved
