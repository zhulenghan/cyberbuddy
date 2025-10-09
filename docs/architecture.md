# Cyber Buddy - System Architecture Design Document

**Version:** 1.1
**Date:** 2025-10-09
**Author:** System Architect
**Update:** Added Monorepo structure

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Project Structure (Monorepo)](#3-project-structure-monorepo)
4. [Architectural Principles](#4-architectural-principles)
5. [System Architecture](#5-system-architecture)
6. [Component Design](#6-component-design)
7. [Data Architecture](#7-data-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Scalability & Performance](#9-scalability--performance)
10. [API Design](#10-api-design)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Monitoring & Observability](#12-monitoring--observability)
13. [Anti-Patterns to Avoid](#13-anti-patterns-to-avoid)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Executive Summary

Cyber Buddy is a Chrome extension that provides an AI-powered, personalized desktop pet companion. The system combines browser activity tracking, AI-generated pet avatars, focus management, and personalized reporting to create an engaging productivity tool.

### Key Design Goals
- **Scalability**: Support 100K+ concurrent users
- **Performance**: <100ms pet state transitions, <2s image generation
- **Reliability**: 99.9% uptime, offline-first capability
- **Maintainability**: Modular architecture, clean separation of concerns
- **Security**: Zero-trust model, E2E encryption for sensitive data

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Popup UI   │  │Content Script│  │  Background  │      │
│  │   (React)    │  │  (Pet Widget)│  │Service Worker│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS/REST
                            │
                   ┌────────▼────────┐
                   │  AWS API Gateway │
                   │  (REST + WebSocket)│
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
   │  Lambda  │      │  Cognito   │     │     S3     │
   │Functions │      │   + OAuth  │     │ (Images)   │
   └────┬─────┘      └────────────┘     └────────────┘
        │
   ┌────▼──────┐
   │ DynamoDB  │
   │(User Data)│
   └───────────┘
```

### 2.2 Technology Stack

#### Frontend (Chrome Extension)
- **Framework**: React 19 + TypeScript 5
- **Build Tool**: WXT (Web Extension Tools)
- **State Management**: Zustand (lightweight, no Redux boilerplate)
- **Styling**: Tailwind CSS (utility-first, pixel art theme)
- **Animation**: Framer Motion
- **Storage**: Chrome Storage API + IndexedDB
- **Testing**: Vitest + React Testing Library

#### Backend (AWS)
- **API Gateway**: REST + WebSocket for real-time updates
- **Compute**: Lambda (Node.js 20 runtime)
- **Database**: DynamoDB (single-table design)
- **Auth**: Cognito + Google OAuth 2.0
- **Storage**: S3 (pet images, static assets)
- **AI**: Google Gemini Nano API (Banana) for image generation
- **IaC**: AWS CDK (TypeScript)

---

## 3. Project Structure (Monorepo)

### 3.1 Overview

The project uses a **monorepo structure** to organize frontend (Chrome Extension) and backend (AWS Services) code in a single repository. This approach provides:

- ✅ **Unified version control**: Frontend and backend versions are always in sync
- ✅ **Shared type definitions**: Common types used by both frontend and backend
- ✅ **Simplified CI/CD**: Single pipeline for both deployments
- ✅ **Better developer experience**: Easy to make cross-stack changes

### 3.2 Directory Structure

```
cyberbuddy/                              # Git repository root
│
├── 📁 extension/                        # Frontend Chrome Extension
│   ├── entrypoints/                     # WXT entry points
│   │   ├── background.ts                # Service Worker
│   │   ├── content/                     # Content Scripts
│   │   │   ├── index.ts
│   │   │   └── PetWidget.tsx
│   │   ├── popup/                       # Popup UI
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   └── App.tsx
│   │   ├── sidepanel/                   # Side Panel (optional)
│   │   └── options/                     # Options page
│   │
│   ├── src/                             # Source code
│   │   ├── components/                  # React components
│   │   │   ├── common/
│   │   │   ├── pet/
│   │   │   ├── generator/
│   │   │   ├── focus/
│   │   │   ├── reports/
│   │   │   ├── onboarding/
│   │   │   └── settings/
│   │   │
│   │   ├── lib/                         # Frontend-specific libraries
│   │   │   ├── api/                     # API client
│   │   │   │   └── client.ts
│   │   │   ├── storage/                 # Storage layer
│   │   │   │   ├── chrome-storage.ts
│   │   │   │   ├── indexed-db.ts
│   │   │   │   └── sync.ts
│   │   │   ├── classifier/              # Page classifier
│   │   │   │   ├── index.ts
│   │   │   │   └── strategies.ts
│   │   │   ├── tracker/                 # Time tracker
│   │   │   │   ├── time-tracker.ts
│   │   │   │   └── idle-detector.ts
│   │   │   └── utils/                   # Frontend utilities
│   │   │       ├── image.ts
│   │   │       └── logger.ts
│   │   │
│   │   ├── store/                       # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── petStore.ts
│   │   │   ├── activityStore.ts
│   │   │   ├── settingsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                       # React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePet.ts
│   │   │   ├── useActivityTracker.ts
│   │   │   └── useStorage.ts
│   │   │
│   │   └── constants/                   # Frontend constants
│   │       └── config.ts
│   │
│   ├── assets/                          # Static assets
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── public/                          # Public assets
│   │   ├── icon/
│   │   └── manifest.json (generated)
│   │
│   ├── package.json                     # Extension dependencies
│   ├── tsconfig.json                    # TypeScript config
│   ├── wxt.config.ts                    # WXT config
│   ├── tailwind.config.js               # Tailwind config
│   └── postcss.config.js                # PostCSS config
│
├── 📁 backend/                          # Backend AWS Services
│   │
│   ├── 📁 lambda/                       # Lambda functions
│   │   ├── auth/                        # Authentication handler
│   │   │   ├── src/
│   │   │   │   ├── index.ts             # Main handler
│   │   │   │   ├── google-auth.ts
│   │   │   │   └── token-refresh.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── pet-generator/               # Pet generation handler
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── gemini-client.ts
│   │   │   │   └── image-processor.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── activity-tracker/            # Activity logging
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── stats-calculator.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── report-generator/            # Report generation
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── ai-message.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   └── layers/                      # Lambda layers (shared deps)
│   │       └── nodejs/
│   │           └── package.json
│   │
│   ├── 📁 infrastructure/               # AWS CDK Infrastructure as Code
│   │   ├── bin/
│   │   │   └── app.ts                   # CDK app entry point
│   │   │
│   │   ├── lib/                         # CDK stacks
│   │   │   ├── auth-stack.ts            # Cognito, user pool
│   │   │   ├── api-stack.ts             # API Gateway
│   │   │   ├── lambda-stack.ts          # Lambda functions
│   │   │   ├── database-stack.ts        # DynamoDB tables
│   │   │   ├── storage-stack.ts         # S3 buckets
│   │   │   └── monitoring-stack.ts      # CloudWatch, alarms
│   │   │
│   │   ├── cdk.json                     # CDK configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── 📁 scripts/                      # Backend utility scripts
│       ├── deploy.sh                    # Deployment script
│       ├── seed-data.ts                 # Database seeding
│       └── test-api.sh                  # API testing
│
├── 📁 shared/                           # ⭐ Shared code (Frontend + Backend)
│   ├── types/                           # Shared TypeScript types
│   │   ├── activity.ts                  # Activity types
│   │   ├── pet.ts                       # Pet types
│   │   ├── user.ts                      # User types
│   │   ├── api.ts                       # API contracts
│   │   └── index.ts
│   │
│   ├── constants/                       # Shared constants
│   │   ├── labels.ts                    # Activity labels
│   │   ├── api-endpoints.ts             # API endpoint definitions
│   │   └── errors.ts                    # Error codes
│   │
│   ├── utils/                           # Shared utilities
│   │   ├── validation.ts                # Input validation
│   │   ├── date.ts                      # Date utilities
│   │   └── helpers.ts                   # Common helpers
│   │
│   ├── package.json                     # Shared package config
│   └── tsconfig.json                    # Shared TS config
│
├── 📁 docs/                             # Documentation
│   ├── PRD.md                           # Product requirements
│   ├── mvp.md                           # MVP scope
│   ├── architecture.md                  # This file
│   ├── api.md                           # API documentation
│   ├── deployment.md                    # Deployment guide
│   └── figma/                           # Design assets
│
├── 📁 .github/                          # GitHub workflows
│   └── workflows/
│       ├── extension-ci.yml             # Extension CI/CD
│       ├── backend-ci.yml               # Backend CI/CD
│       └── shared-tests.yml             # Shared code tests
│
├── .gitignore                           # Git ignore rules
├── README.md                            # Project README
├── package.json                         # Root workspace config (optional)
└── turbo.json                           # Turborepo config (optional)
```

### 3.3 Package Management

#### Option A: npm/pnpm Workspaces (Recommended)

```json
// Root package.json
{
  "name": "cyber-buddy-monorepo",
  "private": true,
  "workspaces": [
    "extension",
    "backend/lambda/*",
    "backend/infrastructure",
    "shared"
  ],
  "scripts": {
    "dev:extension": "npm run dev --workspace=extension",
    "build:extension": "npm run build --workspace=extension",
    "deploy:backend": "npm run deploy --workspace=backend/infrastructure",
    "test": "npm run test --workspaces"
  }
}
```

#### Option B: Independent Packages

Each directory manages its own dependencies independently. Shared code is referenced via relative paths or symlinks.

### 3.4 Shared Code Usage

#### In Extension (Frontend)

```typescript
// extension/src/components/PetGenerator.tsx
import { Pet, PetState } from '../../../shared/types'
import { LABEL_TO_PET_STATE } from '../../../shared/constants/labels'
import { validatePetPrompt } from '../../../shared/utils/validation'

// Or with workspace alias
import { Pet, PetState } from '@cyber-buddy/shared/types'
```

#### In Lambda (Backend)

```typescript
// backend/lambda/pet-generator/src/index.ts
import { Pet, PetGenerationRequest } from '../../../../shared/types'
import { API_ERRORS } from '../../../../shared/constants/errors'

// Or with workspace alias
import { Pet } from '@cyber-buddy/shared/types'
```

### 3.5 Build & Deployment Flow

```
┌─────────────────────────────────────────────────────┐
│                  Developer Workflow                  │
└─────────────────────────────────────────────────────┘
                          │
                          │ git push
                          ▼
┌─────────────────────────────────────────────────────┐
│                   GitHub Actions                     │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Extension Build │           │  Backend Deploy  │
│  (WXT)           │           │  (AWS CDK)       │
└──────────────────┘           └──────────────────┘
          │                               │
          │                               │
          ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│ Chrome Web Store │           │   AWS Cloud      │
│  (.zip upload)   │           │  (Lambda, etc)   │
└──────────────────┘           └──────────────────┘
```

### 3.6 Key Benefits of This Structure

1. **Type Safety Across Stack**
   - Frontend and backend share the same TypeScript types
   - API contract violations caught at compile time
   - No drift between request/response schemas

2. **Code Reuse**
   - Validation logic shared between client and server
   - Constants (like activity labels) defined once
   - Utilities used by both frontend and backend

3. **Simplified Versioning**
   - Single source of truth for API versions
   - Frontend and backend always compatible
   - Easy to coordinate breaking changes

4. **Better DX (Developer Experience)**
   - Single `git clone` to get entire codebase
   - Jump between frontend/backend code easily
   - Unified linting, formatting, testing

5. **Efficient CI/CD**
   - Smart builds (only rebuild changed packages)
   - Parallel testing of frontend/backend
   - Coordinated deployments

### 3.7 Dependency Graph

```
┌──────────────┐
│    shared    │  ← Base layer (no dependencies)
└──────────────┘
        ▲
        │
   ┌────┴─────┐
   │          │
   ▼          ▼
┌──────┐  ┌──────┐
│extension│  │backend│  ← Depend on shared
└──────┘  └──────┘
```

### 3.8 TypeScript Configuration

Each package has its own `tsconfig.json` extending from a shared base:

```json
// shared/tsconfig.json (base)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}

// extension/tsconfig.json
{
  "extends": "../shared/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx"
  },
  "include": ["src/**/*", "entrypoints/**/*"]
}

// backend/lambda/auth/tsconfig.json
{
  "extends": "../../../shared/tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",  // Lambda needs CommonJS
    "target": "ES2022"
  },
  "include": ["src/**/*"]
}
```

---

## 4. Architectural Principles

### 3.1 Design Patterns Applied

#### 3.1.1 **Event-Driven Architecture (EDA)**
- Chrome extension components communicate via message passing
- Background service worker acts as event bus
- Loose coupling between components

```typescript
// Event Bus Pattern
class EventBus {
  private listeners: Map<string, Set<Function>> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }
}
```

#### 3.1.2 **Repository Pattern**
- Abstract data access layer
- Switch between IndexedDB, Chrome Storage, or API seamlessly

```typescript
interface IActivityRepository {
  save(activity: Activity): Promise<void>
  findByDateRange(start: Date, end: Date): Promise<Activity[]>
  getStats(): Promise<ActivityStats>
}

class ActivityRepository implements IActivityRepository {
  constructor(
    private localStore: ILocalStorage,
    private remoteStore: IRemoteStorage
  ) {}

  async save(activity: Activity) {
    // Save locally first (offline-first)
    await this.localStore.save(activity)
    // Sync to cloud in background
    await this.syncQueue.enqueue(() => this.remoteStore.save(activity))
  }
}
```

#### 3.1.3 **Strategy Pattern**
- Page classification strategies
- Multiple algorithms for content analysis

```typescript
interface IClassificationStrategy {
  classify(page: PageContext): ActivityLabel
}

class URLPatternStrategy implements IClassificationStrategy {
  classify(page: PageContext): ActivityLabel {
    // Fast URL-based classification
  }
}

class ContentAnalysisStrategy implements IClassificationStrategy {
  classify(page: PageContext): ActivityLabel {
    // Deep content analysis (slower but accurate)
  }
}

class PageClassifier {
  constructor(private strategies: IClassificationStrategy[]) {}

  classify(page: PageContext): ActivityLabel {
    // Try strategies in priority order
    for (const strategy of this.strategies) {
      const result = strategy.classify(page)
      if (result.confidence > 0.8) return result
    }
    return defaultLabel
  }
}
```

#### 3.1.4 **Observer Pattern**
- Pet state changes trigger UI updates across all tabs
- Centralized state management with Zustand

```typescript
// Zustand store with observer pattern
const usePetStore = create<PetState>((set, get) => ({
  currentState: 'idle',
  position: { x: 0, y: 0 },

  // Observable actions
  updateState: (newState: PetStateType) => {
    set({ currentState: newState })
    // Notify all observers
    chrome.runtime.sendMessage({ type: 'PET_STATE_CHANGE', state: newState })
  }
}))
```

#### 3.1.5 **Dependency Injection (DI)**
- Testable, loosely coupled components
- Easy to mock for testing

```typescript
// DI Container
class Container {
  private services = new Map<string, any>()

  register<T>(key: string, factory: () => T) {
    this.services.set(key, factory)
  }

  resolve<T>(key: string): T {
    return this.services.get(key)()
  }
}

// Usage
container.register('apiClient', () => new ApiClient(config))
container.register('petService', () =>
  new PetService(
    container.resolve('apiClient'),
    container.resolve('storage')
  )
)
```

### 3.2 SOLID Principles

#### Single Responsibility Principle (SRP)
- Each module has ONE reason to change
- `PageClassifier` only classifies pages
- `TimeTracker` only tracks time
- `PetAnimator` only handles animations

#### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- New classification strategies can be added without changing core logic
- New pet behaviors extend base `PetBehavior` class

#### Liskov Substitution Principle (LSP)
- All storage implementations (`ChromeStorage`, `IndexedDBStorage`) are interchangeable
- Any `IClassificationStrategy` can replace another

#### Interface Segregation Principle (ISP)
- Small, focused interfaces
- `IReadableStorage` vs `IWritableStorage` vs `ISyncableStorage`

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Services depend on `IApiClient` interface, not concrete `FetchApiClient`

### 3.3 Additional Principles

- **DRY (Don't Repeat Yourself)**: Shared utilities in `src/lib/utils`
- **KISS (Keep It Simple)**: Avoid over-engineering, use native APIs where possible
- **YAGNI (You Aren't Gonna Need It)**: No premature optimization
- **Separation of Concerns**: UI, Business Logic, Data Access layers clearly separated

---

## 4. System Architecture

### 4.1 Chrome Extension Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Background Service Worker                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Tab Manager  │  │Page Classifier│  │Sync Engine│ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │State Manager │  │ API Gateway  │  │Auth Guard│ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │ Message Passing                             │
│  ┌────────────┴─────────────┬──────────────────────────┐   │
│  │                          │                           │   │
│  │  ┌────────────────┐      │      ┌────────────────┐  │   │
│  │  │  Content Script │     │      │    Popup UI    │  │   │
│  │  │                │     │      │                │  │   │
│  │  │  ┌──────────┐  │     │      │  ┌──────────┐  │  │   │
│  │  │  │Pet Widget│  │     │      │  │Dashboard │  │  │   │
│  │  │  └──────────┘  │     │      │  └──────────┘  │  │   │
│  │  │  ┌──────────┐  │     │      │  ┌──────────┐  │  │   │
│  │  │  │  Timer   │  │     │      │  │Generator │  │  │   │
│  │  │  └──────────┘  │     │      │  └──────────┘  │  │   │
│  │  │  ┌──────────┐  │     │      │  ┌──────────┐  │  │   │
│  │  │  │Page Scraper│ │     │      │  │ Reports  │  │  │   │
│  │  │  └──────────┘  │     │      │  └──────────┘  │  │   │
│  │  └────────────────┘     │      └────────────────┘  │   │
│  └─────────────────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Communication

```typescript
// Message Types (Typed Events)
enum MessageType {
  // State Sync
  PET_STATE_CHANGE = 'pet:state:change',
  ACTIVITY_LOGGED = 'activity:logged',

  // Commands
  START_FOCUS_TIMER = 'focus:start',
  STOP_FOCUS_TIMER = 'focus:stop',

  // Queries
  GET_DAILY_STATS = 'query:daily:stats',
  GET_PET_STATE = 'query:pet:state',
}

// Type-safe message passing
interface Message<T = any> {
  type: MessageType
  payload: T
  timestamp: number
  sender: 'background' | 'content' | 'popup'
}

// Background Service Worker (Event Bus)
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  switch (message.type) {
    case MessageType.PET_STATE_CHANGE:
      // Broadcast to all content scripts
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id!, message)
        })
      })
      break

    case MessageType.GET_DAILY_STATS:
      // Query and respond
      activityRepository.getDailyStats().then(sendResponse)
      return true // Async response
  }
})
```

### 4.3 State Management Architecture

```typescript
// Zustand Store Structure (Single Source of Truth)

// 1. Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  login: (googleToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

// 2. Pet Store
interface PetState {
  currentPet: Pet | null
  availablePets: Pet[]
  currentState: PetStateType // 'idle' | 'happy' | 'focused' | 'tired' | 'excited'
  position: { x: number; y: number }

  generatePet: (prompt: string) => Promise<Pet>
  selectPet: (petId: string) => void
  updateState: (state: PetStateType) => void
  movePet: (position: Position) => void
}

// 3. Activity Store
interface ActivityState {
  currentPage: PageInfo | null
  currentLabel: ActivityLabel
  todayStats: ActivityStats
  isTracking: boolean

  startTracking: () => void
  stopTracking: () => void
  logActivity: (activity: Activity) => Promise<void>
  getReport: (date: Date) => Promise<DailyReport>
}

// 4. Settings Store
interface SettingsState {
  preferences: UserPreferences
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
}

// Store Composition (Avoid God Object Anti-Pattern)
const useStore = create<RootState>((set, get) => ({
  auth: createAuthSlice(set, get),
  pet: createPetSlice(set, get),
  activity: createActivitySlice(set, get),
  settings: createSettingsSlice(set, get),
}))
```

---

## 5. Component Design

### 5.1 Background Service Worker

**Responsibilities:**
- Tab lifecycle management
- Page classification orchestration
- State synchronization across tabs/windows
- API request coordination
- Offline sync queue

```typescript
// entrypoints/background.ts

class BackgroundController {
  private tabManager: TabManager
  private classifier: PageClassifier
  private syncEngine: SyncEngine
  private apiClient: ApiClient

  constructor() {
    this.tabManager = new TabManager()
    this.classifier = new PageClassifier([
      new URLPatternStrategy(),
      new ContentAnalysisStrategy(),
    ])
    this.syncEngine = new SyncEngine()
    this.apiClient = new ApiClient()

    this.setupListeners()
  }

  private setupListeners() {
    // Tab activation
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      await this.handleTabChange(tab)
    })

    // Tab update (URL change)
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        await this.handleTabChange(tab)
      }
    })

    // Window focus change
    chrome.windows.onFocusChanged.addListener(async (windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await this.handleWindowBlur()
      } else {
        await this.handleWindowFocus(windowId)
      }
    })

    // Message from content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))
  }

  private async handleTabChange(tab: chrome.tabs.Tab) {
    if (!tab.url) return

    // Classify page
    const label = await this.classifier.classify({
      url: tab.url,
      title: tab.title,
    })

    // Determine pet state based on label
    const petState = this.mapLabelToPetState(label)

    // Broadcast state change
    await this.broadcastPetStateChange(petState)

    // Log activity
    await this.logActivity({
      label,
      url: tab.url,
      title: tab.title,
      timestamp: Date.now(),
    })
  }

  private async broadcastPetStateChange(state: PetStateType) {
    // Update all content scripts
    const tabs = await chrome.tabs.query({})
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: MessageType.PET_STATE_CHANGE,
          payload: { state },
        }).catch(() => {
          // Tab not ready, ignore
        })
      }
    })
  }
}

// Initialize
const controller = new BackgroundController()
```

### 5.2 Content Script (Pet Widget)

**Responsibilities:**
- Inject pet UI into page
- Render pet animations
- Extract page content for classification
- Handle user interactions with pet

```typescript
// entrypoints/content/index.ts

class ContentScriptController {
  private petWidget: PetWidget | null = null
  private pageObserver: MutationObserver | null = null

  async init() {
    // Create shadow DOM for isolation
    const container = document.createElement('div')
    container.id = 'cyber-buddy-root'
    document.body.appendChild(container)

    const shadowRoot = container.attachShadow({ mode: 'open' })

    // Mount React app in shadow DOM
    const root = createRoot(shadowRoot)
    root.render(<PetWidget ref={ref => this.petWidget = ref} />)

    // Listen for state changes from background
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))

    // Observe page changes
    this.observePageChanges()
  }

  private handleMessage(message: Message) {
    switch (message.type) {
      case MessageType.PET_STATE_CHANGE:
        this.petWidget?.updateState(message.payload.state)
        break

      case MessageType.START_FOCUS_TIMER:
        this.petWidget?.showFocusTimer(message.payload.duration)
        break
    }
  }

  private observePageChanges() {
    // Observe DOM changes to re-classify page if content changes significantly
    this.pageObserver = new MutationObserver(debounce(() => {
      const content = this.extractPageContent()
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTENT_CHANGED',
        payload: { content },
      })
    }, 2000))

    this.pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  private extractPageContent(): PageContent {
    // Extract meaningful content for classification
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(el => el.textContent)
      .filter(Boolean)
      .slice(0, 5)

    const metaDescription = document.querySelector('meta[name="description"]')
      ?.getAttribute('content')

    const bodyText = document.body.innerText.slice(0, 1000)

    return {
      headings,
      metaDescription,
      bodyText,
      url: window.location.href,
      title: document.title,
    }
  }
}

// Auto-init
const controller = new ContentScriptController()
controller.init()
```

### 5.3 Page Classification System

**Multi-Strategy Approach:**

```typescript
// src/lib/classifier/strategies.ts

// Strategy 1: URL Pattern Matching (Fastest, ~1ms)
class URLPatternStrategy implements IClassificationStrategy {
  private patterns: Map<ActivityLabel, RegExp[]> = new Map([
    [ActivityLabel.LEARNING, [
      /coursera\.com/,
      /udemy\.com/,
      /stackoverflow\.com/,
      /github\.com\/.*\/blob/,
      /docs\..*\.com/,
    ]],
    [ActivityLabel.ENTERTAINMENT, [
      /youtube\.com\/watch/,
      /netflix\.com/,
      /twitch\.tv/,
      /reddit\.com\/r\/(funny|memes)/,
    ]],
    [ActivityLabel.SOCIAL, [
      /facebook\.com/,
      /twitter\.com|x\.com/,
      /instagram\.com/,
      /linkedin\.com\/feed/,
    ]],
    [ActivityLabel.WORKING, [
      /docs\.google\.com/,
      /notion\.so/,
      /slack\.com/,
      /mail\.google\.com/,
    ]],
    [ActivityLabel.SHOPPING, [
      /amazon\.com/,
      /ebay\.com/,
      /shopify\.com/,
    ]],
  ])

  classify(page: PageContext): ClassificationResult {
    for (const [label, patterns] of this.patterns) {
      if (patterns.some(pattern => pattern.test(page.url))) {
        return { label, confidence: 0.9 }
      }
    }
    return { label: ActivityLabel.OTHER, confidence: 0.5 }
  }
}

// Strategy 2: Keyword Analysis (Medium, ~10ms)
class KeywordStrategy implements IClassificationStrategy {
  private keywords: Map<ActivityLabel, Set<string>> = new Map([
    [ActivityLabel.LEARNING, new Set([
      'tutorial', 'documentation', 'learn', 'course', 'lesson', 'study'
    ])],
    [ActivityLabel.ENTERTAINMENT, new Set([
      'watch', 'video', 'movie', 'game', 'play', 'stream'
    ])],
    // ... more keywords
  ])

  classify(page: PageContext): ClassificationResult {
    const text = `${page.title} ${page.content}`.toLowerCase()
    const scores = new Map<ActivityLabel, number>()

    for (const [label, keywords] of this.keywords) {
      let score = 0
      for (const keyword of keywords) {
        if (text.includes(keyword)) score++
      }
      scores.set(label, score)
    }

    const [topLabel, topScore] = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])[0]

    const confidence = topScore / 10 // Normalize
    return { label: topLabel, confidence }
  }
}

// Strategy 3: AI Classification (Slowest, ~500ms, fallback only)
class AIStrategy implements IClassificationStrategy {
  constructor(private aiClient: AIClient) {}

  async classify(page: PageContext): Promise<ClassificationResult> {
    const prompt = `Classify this webpage into one category: ${Object.values(ActivityLabel).join(', ')}

Title: ${page.title}
URL: ${page.url}
Content: ${page.content.slice(0, 500)}

Reply with only the category name.`

    const response = await this.aiClient.classify(prompt)
    return {
      label: response as ActivityLabel,
      confidence: 0.95,
    }
  }
}

// Orchestrator
class PageClassifier {
  private strategies: IClassificationStrategy[]
  private cache: LRUCache<string, ClassificationResult>

  constructor(strategies: IClassificationStrategy[]) {
    this.strategies = strategies
    this.cache = new LRUCache({ max: 500 })
  }

  async classify(page: PageContext): Promise<ActivityLabel> {
    const cacheKey = `${page.url}:${page.title}`

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached) return cached.label

    // Try strategies in order (fast to slow)
    for (const strategy of this.strategies) {
      const result = await strategy.classify(page)

      if (result.confidence > 0.8) {
        this.cache.set(cacheKey, result)
        return result.label
      }
    }

    // Default fallback
    return ActivityLabel.OTHER
  }
}
```

### 5.4 Time Tracking System

**Accurate, Battery-Efficient Tracking:**

```typescript
// src/lib/tracker/time-tracker.ts

interface TimeEntry {
  url: string
  title: string
  label: ActivityLabel
  startTime: number
  endTime?: number
  duration: number // milliseconds
  isActive: boolean // User actively viewing (not idle)
}

class TimeTracker {
  private currentEntry: TimeEntry | null = null
  private idleThreshold = 60000 // 1 minute
  private lastActivity = Date.now()
  private checkInterval: NodeJS.Timeout | null = null

  constructor(
    private repository: IActivityRepository,
    private idleDetector: IdleDetector
  ) {
    this.setupIdleDetection()
  }

  startTracking(page: PageInfo, label: ActivityLabel) {
    // Stop previous tracking
    if (this.currentEntry) {
      this.stopTracking()
    }

    this.currentEntry = {
      url: page.url,
      title: page.title,
      label,
      startTime: Date.now(),
      duration: 0,
      isActive: true,
    }

    // Update duration every second
    this.checkInterval = setInterval(() => {
      if (this.currentEntry && this.currentEntry.isActive) {
        this.currentEntry.duration = Date.now() - this.currentEntry.startTime
      }
    }, 1000)
  }

  stopTracking() {
    if (!this.currentEntry) return

    this.currentEntry.endTime = Date.now()
    this.currentEntry.duration = this.currentEntry.endTime - this.currentEntry.startTime

    // Only save if duration > 5 seconds (avoid noise)
    if (this.currentEntry.duration > 5000) {
      this.repository.save(this.currentEntry)
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.currentEntry = null
  }

  private setupIdleDetection() {
    // Use Chrome idle API
    chrome.idle.setDetectionInterval(60) // 60 seconds

    chrome.idle.onStateChanged.addListener((state) => {
      if (state === 'idle' || state === 'locked') {
        // User idle, pause tracking
        if (this.currentEntry) {
          this.currentEntry.isActive = false
        }
      } else {
        // User active again
        if (this.currentEntry) {
          this.currentEntry.isActive = true
          this.currentEntry.startTime = Date.now() // Reset start time
        }
      }
    })
  }

  async getDailyStats(date: Date): Promise<ActivityStats> {
    const entries = await this.repository.findByDate(date)

    // Aggregate by label
    const statsByLabel = entries.reduce((acc, entry) => {
      const label = entry.label
      if (!acc[label]) {
        acc[label] = { duration: 0, count: 0 }
      }
      acc[label].duration += entry.duration
      acc[label].count++
      return acc
    }, {} as Record<ActivityLabel, { duration: number; count: number }>)

    const totalDuration = Object.values(statsByLabel)
      .reduce((sum, stat) => sum + stat.duration, 0)

    return {
      date,
      totalDuration,
      byLabel: statsByLabel,
      topSites: this.getTopSites(entries),
    }
  }

  private getTopSites(entries: TimeEntry[]): Array<{url: string; duration: number}> {
    const siteMap = new Map<string, number>()

    entries.forEach(entry => {
      const domain = new URL(entry.url).hostname
      siteMap.set(domain, (siteMap.get(domain) || 0) + entry.duration)
    })

    return Array.from(siteMap.entries())
      .map(([url, duration]) => ({ url, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
  }
}
```

---

## 6. Data Architecture

### 6.1 Client-Side Storage Strategy

**Offline-First, Multi-Layer Caching:**

```typescript
// Layer 1: Memory Cache (Fastest, 0ms)
class MemoryCache {
  private cache = new Map<string, any>()
  private maxSize = 100

  get<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  set<T>(key: string, value: T, ttl: number = 300000) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
    setTimeout(() => this.cache.delete(key), ttl)
  }
}

// Layer 2: Chrome Storage (Fast, ~5ms)
class ChromeStorageAdapter {
  async get<T>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key)
    return result[key]
  }

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  }

  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  }
}

// Layer 3: IndexedDB (Large data, ~20ms)
class IndexedDBAdapter {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('CyberBuddy', 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Object stores
        if (!db.objectStoreNames.contains('activities')) {
          const store = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true })
          store.createIndex('date', 'date', { unique: false })
          store.createIndex('label', 'label', { unique: false })
        }

        if (!db.objectStoreNames.contains('pets')) {
          db.createObjectStore('pets', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  async saveActivity(activity: Activity): Promise<void> {
    const tx = this.db!.transaction('activities', 'readwrite')
    const store = tx.objectStore('activities')
    store.add(activity)
    await tx.complete
  }

  async getActivitiesByDateRange(start: Date, end: Date): Promise<Activity[]> {
    const tx = this.db!.transaction('activities', 'readonly')
    const store = tx.objectStore('activities')
    const index = store.index('date')

    const range = IDBKeyRange.bound(
      start.toISOString(),
      end.toISOString()
    )

    return new Promise((resolve) => {
      const activities: Activity[] = []
      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          activities.push(cursor.value)
          cursor.continue()
        } else {
          resolve(activities)
        }
      }
    })
  }
}

// Unified Storage Interface
class StorageManager {
  constructor(
    private memoryCache: MemoryCache,
    private chromeStorage: ChromeStorageAdapter,
    private indexedDB: IndexedDBAdapter
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    // Try memory first
    let value = this.memoryCache.get<T>(key)
    if (value !== undefined) return value

    // Try Chrome storage
    value = await this.chromeStorage.get<T>(key)
    if (value !== undefined) {
      this.memoryCache.set(key, value)
      return value
    }

    return undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.memoryCache.set(key, value)
    await this.chromeStorage.set(key, value)
  }
}
```

### 6.2 Backend Data Model (DynamoDB Single-Table Design)

**Why Single-Table?**
- Reduces latency (no joins across tables)
- Simplifies scaling
- Follows AWS best practices

```typescript
// DynamoDB Table: CyberBuddy

// Primary Key Structure:
// PK (Partition Key): USER#<userId> | PET#<petId> | ACTIVITY#<date>
// SK (Sort Key): METADATA | PET#<petId> | ACTIVITY#<timestamp>

// Example Items:

// 1. User Metadata
{
  PK: "USER#google-oauth2|123456",
  SK: "METADATA",
  email: "user@example.com",
  name: "John Doe",
  createdAt: "2025-01-01T00:00:00Z",
  subscription: "free",
  generationsRemaining: 5,
  GSI1PK: "USER",
  GSI1SK: "2025-01-01T00:00:00Z"
}

// 2. Pet Record
{
  PK: "USER#google-oauth2|123456",
  SK: "PET#pet-uuid-1",
  petId: "pet-uuid-1",
  prompt: "astronaut avocado",
  imageUrl: "https://s3.../pet-uuid-1.png",
  states: {
    idle: "https://s3.../pet-uuid-1-idle.png",
    happy: "https://s3.../pet-uuid-1-happy.png",
    focused: "https://s3.../pet-uuid-1-focused.png",
    tired: "https://s3.../pet-uuid-1-tired.png",
    excited: "https://s3.../pet-uuid-1-excited.png"
  },
  createdAt: "2025-01-15T10:00:00Z",
  isActive: true,
  GSI1PK: "PET",
  GSI1SK: "2025-01-15T10:00:00Z"
}

// 3. Daily Activity Summary
{
  PK: "USER#google-oauth2|123456",
  SK: "ACTIVITY#2025-01-20",
  date: "2025-01-20",
  stats: {
    learning: { duration: 7200000, count: 15 },
    working: { duration: 14400000, count: 30 },
    entertainment: { duration: 3600000, count: 10 }
  },
  totalDuration: 25200000,
  topSites: [
    { domain: "github.com", duration: 5400000 },
    { domain: "stackoverflow.com", duration: 3600000 }
  ],
  GSI1PK: "ACTIVITY",
  GSI1SK: "2025-01-20"
}

// Access Patterns:

// 1. Get user metadata
//    Query: PK = "USER#<userId>" AND SK = "METADATA"

// 2. Get all pets for a user
//    Query: PK = "USER#<userId>" AND begins_with(SK, "PET#")

// 3. Get activity for date range
//    Query: PK = "USER#<userId>" AND SK BETWEEN "ACTIVITY#2025-01-01" AND "ACTIVITY#2025-01-31"

// 4. Get all users (admin)
//    Query GSI1: GSI1PK = "USER"

// GSI1 (Global Secondary Index) for admin queries
// GSI1PK: Entity type
// GSI1SK: Timestamp for sorting
```

### 6.3 Data Sync Strategy

**Problem**: User switches devices, needs data synced
**Solution**: Event-driven sync with conflict resolution

```typescript
class SyncEngine {
  private syncQueue: Queue<SyncTask> = new Queue()
  private isOnline = navigator.onLine

  constructor(
    private localStore: ILocalStorage,
    private remoteStore: IRemoteStorage
  ) {
    this.setupNetworkListeners()
    this.startSyncLoop()
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async syncActivity(activity: Activity) {
    // Save locally first (optimistic update)
    await this.localStore.saveActivity(activity)

    if (this.isOnline) {
      try {
        await this.remoteStore.saveActivity(activity)
      } catch (error) {
        // Queue for retry
        this.syncQueue.enqueue({
          type: 'activity',
          data: activity,
          retries: 0,
        })
      }
    } else {
      this.syncQueue.enqueue({
        type: 'activity',
        data: activity,
        retries: 0,
      })
    }
  }

  private async processSyncQueue() {
    while (!this.syncQueue.isEmpty() && this.isOnline) {
      const task = this.syncQueue.dequeue()

      try {
        switch (task.type) {
          case 'activity':
            await this.remoteStore.saveActivity(task.data)
            break
          case 'pet':
            await this.remoteStore.savePet(task.data)
            break
        }
      } catch (error) {
        if (task.retries < 3) {
          task.retries++
          this.syncQueue.enqueue(task)
        } else {
          console.error('Sync failed after 3 retries', task)
        }
      }

      // Rate limiting
      await sleep(100)
    }
  }

  private startSyncLoop() {
    // Try to sync every 5 minutes
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue()
      }
    }, 300000)
  }
}
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```typescript
// OAuth 2.0 with Google + AWS Cognito

// Step 1: Extension initiates login
async function loginWithGoogle() {
  // Use chrome.identity for OAuth
  const redirectURL = chrome.identity.getRedirectURL()
  const authURL = new URL('https://accounts.google.com/o/oauth2/auth')

  authURL.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
  authURL.searchParams.set('response_type', 'token id_token')
  authURL.searchParams.set('redirect_uri', redirectURL)
  authURL.searchParams.set('scope', 'openid email profile')

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authURL.toString(),
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          // Parse tokens from URL fragment
          const params = new URLSearchParams(responseUrl.split('#')[1])
          const idToken = params.get('id_token')
          resolve(idToken)
        }
      }
    )
  })
}

// Step 2: Exchange Google token for Cognito credentials
async function exchangeTokenForCognito(googleIdToken: string) {
  const response = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: googleIdToken }),
  })

  const { accessToken, refreshToken, expiresIn } = await response.json()

  // Store securely
  await chrome.storage.local.set({
    accessToken,
    refreshToken,
    tokenExpiry: Date.now() + expiresIn * 1000,
  })

  return accessToken
}

// Lambda function (backend)
export const googleAuthHandler = async (event: APIGatewayEvent) => {
  const { idToken } = JSON.parse(event.body)

  // Verify Google token
  const googleUser = await verifyGoogleToken(idToken)

  // Get or create Cognito user
  const cognitoUser = await getOrCreateCognitoUser(googleUser)

  // Generate Cognito tokens
  const tokens = await generateCognitoTokens(cognitoUser)

  return {
    statusCode: 200,
    body: JSON.stringify(tokens),
  }
}
```

### 7.2 API Security

```typescript
// API Client with token refresh

class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number = 0

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Ensure token is valid
    await this.ensureValidToken()

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options?.headers,
      },
    })

    if (response.status === 401) {
      // Token expired, refresh and retry
      await this.refreshAccessToken()
      return this.request(endpoint, options)
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text())
    }

    return response.json()
  }

  private async ensureValidToken() {
    if (Date.now() >= this.tokenExpiry - 60000) {
      await this.refreshAccessToken()
    }
  }

  private async refreshAccessToken() {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    })

    if (!response.ok) {
      // Refresh failed, user needs to re-login
      throw new AuthenticationError('Session expired')
    }

    const { accessToken, expiresIn } = await response.json()

    this.accessToken = accessToken
    this.tokenExpiry = Date.now() + expiresIn * 1000

    await chrome.storage.local.set({
      accessToken,
      tokenExpiry: this.tokenExpiry,
    })
  }
}
```

### 7.3 Content Security

```typescript
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; img-src 'self' data: https://s3.amazonaws.com;"
  },
  "permissions": [
    "storage",
    "tabs",
    "idle",
    "identity"
  ],
  "host_permissions": [
    "https://*.cyberbuddy.com/*"
  ],
  "optional_host_permissions": [
    "<all_urls>"
  ]
}

// Request minimal permissions initially
// Request <all_urls> only when user wants pet on all sites
async function requestAllSitesPermission() {
  const granted = await chrome.permissions.request({
    origins: ['<all_urls>']
  })

  if (!granted) {
    // User denied, show explanation
    showPermissionExplanation()
  }
}
```

### 7.4 Data Privacy

```typescript
// NEVER log sensitive data
class Logger {
  static log(message: string, data?: any) {
    // Redact sensitive fields
    const sanitized = this.sanitize(data)
    console.log(message, sanitized)
  }

  private static sanitize(data: any): any {
    if (!data) return data

    const sensitiveFields = ['email', 'token', 'password', 'accessToken']
    const sanitized = { ...data }

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }
}

// Encrypt sensitive data in Chrome storage
class SecureStorage {
  async set(key: string, value: any) {
    const encrypted = await this.encrypt(JSON.stringify(value))
    await chrome.storage.local.set({ [key]: encrypted })
  }

  async get(key: string) {
    const result = await chrome.storage.local.get(key)
    if (!result[key]) return undefined
    const decrypted = await this.decrypt(result[key])
    return JSON.parse(decrypted)
  }

  private async encrypt(data: string): Promise<string> {
    // Use Web Crypto API
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    const key = await this.getOrCreateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  private async decrypt(encrypted: string): Promise<string> {
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    const key = await this.getOrCreateKey()

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  private async getOrCreateKey(): Promise<CryptoKey> {
    // Derive key from extension ID (consistent across sessions)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(chrome.runtime.id),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('cyber-buddy-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }
}
```

---

## 8. Scalability & Performance

### 8.1 Frontend Performance

**Target Metrics:**
- First Paint: <100ms
- Pet state transition: <50ms
- Page classification: <10ms (URL), <50ms (keyword), <500ms (AI)
- Memory usage: <50MB per tab

**Optimizations:**

```typescript
// 1. Code Splitting
// Lazy load heavy components
const ReportPage = React.lazy(() => import('./components/reports/DailyReport'))
const PetGenerator = React.lazy(() => import('./components/generator/PetGenerator'))

// 2. Image Optimization
async function optimizePetImage(blob: Blob): Promise<Blob> {
  // Resize to max 256x256
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(256, 256)
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(bitmap, 0, 0, 256, 256)

  return canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.8,
  })
}

// 3. Virtual Scrolling for History
import { FixedSizeList } from 'react-window'

function PetHistory({ pets }: { pets: Pet[] }) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <PetCard pet={pets[index]} />
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={pets.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}

// 4. Memoization
const PetAvatar = React.memo(({ state, imageUrl }: PetAvatarProps) => {
  return <img src={imageUrl} alt="pet" />
}, (prev, next) => {
  // Only re-render if state or imageUrl changes
  return prev.state === next.state && prev.imageUrl === next.imageUrl
})

// 5. Debounce expensive operations
const debouncedClassify = debounce(async (content: string) => {
  const label = await classifier.classify(content)
  updatePetState(label)
}, 1000)

// 6. Web Workers for heavy computation
// src/workers/image-processor.worker.ts
self.onmessage = async (event) => {
  const { imageData } = event.data

  // Remove white background
  const processed = removeWhiteBackground(imageData)

  self.postMessage({ processed })
}

// Usage
const worker = new Worker(new URL('./workers/image-processor.worker.ts', import.meta.url))
worker.postMessage({ imageData })
worker.onmessage = (event) => {
  const { processed } = event.data
  // Use processed image
}
```

### 8.2 Backend Scalability

**Architecture:**

```
                  ┌─────────────────┐
                  │ CloudFront CDN  │
                  │   (Global)      │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │  API Gateway    │
                  │  (Regional)     │
                  │  - Rate Limit   │
                  │  - Caching      │
                  └────────┬────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │  Lambda     │ │  Lambda    │ │  Lambda    │
    │  (Auth)     │ │ (Pet Gen)  │ │ (Activity) │
    │  128MB      │ │  1024MB    │ │  256MB     │
    │  3s timeout │ │ 30s timeout│ │  6s timeout│
    └──────┬──────┘ └─────┬──────┘ └─────┬──────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                  ┌───────▼────────┐
                  │   DynamoDB     │
                  │   On-Demand    │
                  │   Auto-scaling │
                  └────────────────┘
```

**Lambda Best Practices:**

```typescript
// 1. Connection reuse (outside handler)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 3,
})

// 2. Warm-up connections
export const handler = async (event: APIGatewayEvent) => {
  // Handler logic
}

// 3. Optimize cold starts
// Use Lambda SnapStart (for Java) or keep package small (<10MB)

// 4. Async operations
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const sqsClient = new SQSClient({ region: 'us-east-1' })

export const handler = async (event: APIGatewayEvent) => {
  // Quick response
  const response = { status: 'processing' }

  // Offload heavy work to SQS
  await sqsClient.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify(event),
  }))

  return {
    statusCode: 202,
    body: JSON.stringify(response),
  }
}

// 5. Batch operations
async function batchSaveActivities(activities: Activity[]) {
  const batchSize = 25 // DynamoDB limit

  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize)

    await dynamoClient.send(new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: batch.map(activity => ({
          PutRequest: { Item: marshall(activity) },
        })),
      },
    }))
  }
}
```

**DynamoDB Optimization:**

```typescript
// 1. Use On-Demand billing (auto-scales)
// No need to provision capacity

// 2. Enable Point-in-Time Recovery
// Protects against accidental deletes

// 3. Use conditional writes to prevent conflicts
await dynamoClient.send(new PutItemCommand({
  TableName: TABLE_NAME,
  Item: marshall(item),
  ConditionExpression: 'attribute_not_exists(PK) OR version < :newVersion',
  ExpressionAttributeValues: marshall({
    ':newVersion': item.version,
  }),
}))

// 4. Use TTL for auto-cleanup
// Add TTL field to items that should expire
{
  PK: "USER#123",
  SK: "SESSION#abc",
  expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
}

// 5. Efficient queries with sparse indexes
// GSI for filtering active users
{
  GSI1PK: "USER#ACTIVE", // Only set for active users
  GSI1SK: lastActiveDate,
}
```

### 8.3 Rate Limiting

```typescript
// API Gateway throttling
// Per-user rate limits in Lambda

class RateLimiter {
  private redis: RedisClient // Or DynamoDB

  async checkLimit(userId: string, limit: number, window: number): Promise<boolean> {
    const key = `rate:${userId}:${Math.floor(Date.now() / window)}`

    const count = await this.redis.incr(key)

    if (count === 1) {
      await this.redis.expire(key, window)
    }

    return count <= limit
  }
}

// Usage in Lambda
export const handler = async (event: APIGatewayEvent) => {
  const userId = event.requestContext.authorizer.claims.sub

  // Free tier: 5 generations per day
  const allowed = await rateLimiter.checkLimit(userId, 5, 86400)

  if (!allowed) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Rate limit exceeded' }),
    }
  }

  // Process request
}
```

### 8.4 Caching Strategy

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Browser    │  │ CloudFront   │  │ API Gateway  │
│   Cache      │  │   (CDN)      │  │   Cache      │
│   (5 min)    │  │   (1 hour)   │  │   (1 min)    │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Lambda +   │
                  │  DynamoDB   │
                  └─────────────┘
```

```typescript
// Cache headers
export const handler = async (event: APIGatewayEvent) => {
  const response = {
    statusCode: 200,
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': generateETag(data),
    },
    body: JSON.stringify(data),
  }

  return response
}

// Conditional requests
if (event.headers['If-None-Match'] === currentETag) {
  return {
    statusCode: 304, // Not Modified
    body: '',
  }
}
```

---

## 9. API Design

### 9.1 RESTful Endpoints

```typescript
// Base URL: https://api.cyberbuddy.com/v1

// Auth
POST   /auth/google              // Exchange Google token
POST   /auth/refresh             // Refresh access token
POST   /auth/logout              // Logout

// User
GET    /users/me                 // Get current user
PATCH  /users/me                 // Update profile
DELETE /users/me                 // Delete account

// Pets
GET    /pets                     // List user's pets
POST   /pets                     // Generate new pet
GET    /pets/:petId              // Get pet details
DELETE /pets/:petId              // Delete pet
PATCH  /pets/:petId/activate     // Set as active pet

// Activities
POST   /activities               // Log activity
GET    /activities/stats         // Get stats
  ?startDate=2025-01-01
  &endDate=2025-01-31
  &groupBy=day|week|month

// Reports
GET    /reports/daily/:date      // Get daily report
POST   /reports/generate         // Generate AI report

// Settings
GET    /settings                 // Get user settings
PATCH  /settings                 // Update settings
```

### 9.2 Request/Response Schemas

```typescript
// POST /pets
interface GeneratePetRequest {
  prompt: string           // "astronaut avocado"
  style?: 'pixel' | '3d'   // Default: pixel
}

interface GeneratePetResponse {
  petId: string
  prompt: string
  images: {
    idle: string        // S3 URL
    happy: string
    focused: string
    tired: string
    excited: string
  }
  createdAt: string
}

// POST /activities
interface LogActivityRequest {
  url: string
  title: string
  label: ActivityLabel
  duration: number     // milliseconds
  timestamp: number
}

// GET /activities/stats
interface ActivityStatsResponse {
  startDate: string
  endDate: string
  totalDuration: number
  byLabel: Record<ActivityLabel, {
    duration: number
    count: number
    percentage: number
  }>
  topSites: Array<{
    domain: string
    duration: number
    visits: number
  }>
  dailyBreakdown: Array<{
    date: string
    duration: number
    labels: Record<ActivityLabel, number>
  }>
}

// POST /reports/generate
interface GenerateReportRequest {
  date: string
  petPersonality: string  // User's pet prompt
}

interface GenerateReportResponse {
  date: string
  message: string  // AI-generated personalized message
  stats: ActivityStatsResponse
  achievements: Array<{
    id: string
    title: string
    description: string
    unlockedAt?: string
  }>
}
```

### 9.3 Error Handling

```typescript
// Standardized error response
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  requestId: string
  timestamp: string
}

// Error codes
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Lambda error handler
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

function errorHandler(error: Error): APIGatewayProxyResult {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
      }),
    }
  }

  // Unexpected error
  console.error('Unexpected error:', error)

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }),
  }
}
```

---

## 10. Deployment Architecture

### 10.1 Infrastructure as Code (AWS CDK)

```typescript
// lib/cyberbuddy-stack.ts

import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cognito from 'aws-cdk-lib/aws-cognito'

export class CyberBuddyStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'CyberBuddyTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    // GSI for queries
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    })

    // S3 Bucket for images
    const imageBucket = new s3.Bucket(this, 'PetImageBucket', {
      cors: [{
        allowedOrigins: ['chrome-extension://*'],
        allowedMethods: [s3.HttpMethods.GET],
        allowedHeaders: ['*'],
      }],
      lifecycleRules: [{
        expiration: cdk.Duration.days(365), // Delete old images after 1 year
      }],
    })

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
    })

    const userPoolClient = userPool.addClient('WebClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ['chrome-extension://YOUR_EXTENSION_ID/callback'],
      },
    })

    // Lambda Layer (shared dependencies)
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset('lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared dependencies for all Lambda functions',
    })

    // Lambda Functions
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/auth'),
      environment: {
        TABLE_NAME: table.tableName,
        USER_POOL_ID: userPool.userPoolId,
      },
      layers: [sharedLayer],
      timeout: cdk.Duration.seconds(3),
      memorySize: 128,
    })

    const petFunction = new lambda.Function(this, 'PetFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/pet'),
      environment: {
        TABLE_NAME: table.tableName,
        IMAGE_BUCKET: imageBucket.bucketName,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
      },
      layers: [sharedLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    })

    const activityFunction = new lambda.Function(this, 'ActivityFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/activity'),
      environment: {
        TABLE_NAME: table.tableName,
      },
      layers: [sharedLayer],
      timeout: cdk.Duration.seconds(6),
      memorySize: 256,
    })

    // Grant permissions
    table.grantReadWriteData(authFunction)
    table.grantReadWriteData(petFunction)
    table.grantReadWriteData(activityFunction)
    imageBucket.grantReadWrite(petFunction)

    // API Gateway
    const api = new apigateway.RestApi(this, 'CyberBuddyApi', {
      restApiName: 'Cyber Buddy API',
      defaultCorsPreflightOptions: {
        allowOrigins: ['chrome-extension://*'],
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
    })

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    })

    // API Routes
    const v1 = api.root.addResource('v1')

    const auth = v1.addResource('auth')
    auth.addResource('google').addMethod('POST', new apigateway.LambdaIntegration(authFunction))
    auth.addResource('refresh').addMethod('POST', new apigateway.LambdaIntegration(authFunction))

    const pets = v1.addResource('pets')
    pets.addMethod('GET', new apigateway.LambdaIntegration(petFunction), { authorizer })
    pets.addMethod('POST', new apigateway.LambdaIntegration(petFunction), { authorizer })

    const activities = v1.addResource('activities')
    activities.addMethod('POST', new apigateway.LambdaIntegration(activityFunction), { authorizer })
    activities.addResource('stats').addMethod('GET', new apigateway.LambdaIntegration(activityFunction), { authorizer })

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    })

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    })

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    })
  }
}
```

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run compile

  build-extension:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}

      - name: Upload to Chrome Web Store
        uses: mobilefirstllc/cws-publish@latest
        with:
          client_id: ${{ secrets.CWS_CLIENT_ID }}
          client_secret: ${{ secrets.CWS_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CWS_REFRESH_TOKEN }}
          extension_id: ${{ secrets.CWS_EXTENSION_ID }}
          zip_file: .output/chrome-mv3.zip

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Install CDK
        run: npm install -g aws-cdk

      - name: CDK Deploy
        run: |
          cd infrastructure
          npm ci
          cdk deploy --require-approval never
```

### 10.3 Environment Management

```typescript
// config/environments.ts

export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    googleClientId: 'dev-client-id',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://api-staging.cyberbuddy.com',
    googleClientId: 'staging-client-id',
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.cyberbuddy.com',
    googleClientId: 'prod-client-id',
    logLevel: 'error',
  },
}

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return config[env as keyof typeof config]
}
```

---

## 11. Monitoring & Observability

### 11.1 Logging

```typescript
// Structured logging

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private static instance: Logger

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitize(context),
    }

    // Send to backend
    this.sendLog(entry)

    // Console (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(entry, null, 2))
    }
  }

  error(message: string, error: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })
  }

  private sanitize(data: any): any {
    // Remove sensitive data
    const sensitive = ['token', 'password', 'email']
    if (!data) return data

    const sanitized = { ...data }
    for (const key of sensitive) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    }
    return sanitized
  }

  private async sendLog(entry: LogEntry) {
    try {
      await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch {
      // Fail silently
    }
  }
}

// Usage
const logger = Logger.getInstance()
logger.log(LogLevel.INFO, 'Pet generated', { petId: 'abc123' })
logger.error('Failed to classify page', error, { url: 'https://example.com' })
```

### 11.2 Metrics

```typescript
// Client-side metrics

class Metrics {
  private static buffer: MetricEntry[] = []

  static track(name: string, value: number, tags?: Record<string, string>) {
    this.buffer.push({
      name,
      value,
      tags,
      timestamp: Date.now(),
    })

    // Flush every 100 metrics or 30 seconds
    if (this.buffer.length >= 100) {
      this.flush()
    }
  }

  static async flush() {
    if (this.buffer.length === 0) return

    const metrics = [...this.buffer]
    this.buffer = []

    try {
      await fetch(`${API_BASE}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      })
    } catch {
      // Re-add to buffer
      this.buffer.unshift(...metrics)
    }
  }
}

// Track performance
const start = performance.now()
await classifyPage(page)
const duration = performance.now() - start
Metrics.track('page.classification.duration', duration, { strategy: 'url' })

// Track user actions
Metrics.track('pet.generated', 1, { style: 'pixel' })
Metrics.track('focus.timer.started', 1)
```

### 11.3 Error Tracking

```typescript
// Integration with Sentry or similar

import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Don't send sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})

// Catch unhandled errors
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error)
})

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason)
})

// Manual error reporting
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'PetGenerator' },
    extra: { userId: user.id },
  })
}
```

---

## 12. Anti-Patterns to Avoid

### 12.1 ❌ God Object

**Problem**: One massive object/class that does everything

```typescript
// ❌ BAD
class PetManager {
  generatePet() {}
  savePet() {}
  loadPet() {}
  animatePet() {}
  classifyPage() {}
  trackTime() {}
  generateReport() {}
  // ... 50 more methods
}

// ✅ GOOD - Single Responsibility
class PetGenerator {
  generate(prompt: string): Promise<Pet> {}
}

class PetRepository {
  save(pet: Pet): Promise<void> {}
  load(id: string): Promise<Pet> {}
}

class PetAnimator {
  animate(pet: Pet, state: PetState): void {}
}
```

### 12.2 ❌ Prop Drilling

**Problem**: Passing props through many layers

```typescript
// ❌ BAD
<App>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <UserMenu user={user}>
        <UserAvatar user={user} />
      </UserMenu>
    </Sidebar>
  </Dashboard>
</App>

// ✅ GOOD - Use Context or Zustand
const useAuthStore = create<AuthState>(...)

function UserAvatar() {
  const user = useAuthStore(state => state.user)
  return <img src={user.avatar} />
}
```

### 12.3 ❌ Premature Optimization

**Problem**: Optimizing before identifying bottlenecks

```typescript
// ❌ BAD - Complex memoization for trivial component
const Button = React.memo(({ label }: { label: string }) => {
  return <button>{label}</button>
}, (prev, next) => {
  return prev.label === next.label
})

// ✅ GOOD - Profile first, optimize only if needed
const Button = ({ label }: { label: string }) => {
  return <button>{label}</button>
}
```

### 12.4 ❌ Magic Numbers/Strings

**Problem**: Hard-coded values scattered throughout code

```typescript
// ❌ BAD
if (user.generationsRemaining < 5) {
  showUpgradePrompt()
}

setTimeout(() => checkIdle(), 60000)

// ✅ GOOD - Use constants
const LIMITS = {
  FREE_GENERATIONS: 5,
  IDLE_TIMEOUT: 60000,
}

if (user.generationsRemaining < LIMITS.FREE_GENERATIONS) {
  showUpgradePrompt()
}

setTimeout(() => checkIdle(), LIMITS.IDLE_TIMEOUT)
```

### 12.5 ❌ Callback Hell

**Problem**: Deeply nested callbacks

```typescript
// ❌ BAD
chrome.tabs.query({}, (tabs) => {
  chrome.tabs.get(tabs[0].id, (tab) => {
    chrome.storage.local.get('key', (result) => {
      processData(result, (processed) => {
        saveData(processed, () => {
          console.log('done')
        })
      })
    })
  })
})

// ✅ GOOD - Use async/await
const tabs = await chrome.tabs.query({})
const tab = await chrome.tabs.get(tabs[0].id)
const result = await chrome.storage.local.get('key')
const processed = await processData(result)
await saveData(processed)
console.log('done')
```

### 12.6 ❌ Tight Coupling

**Problem**: Components directly depend on concrete implementations

```typescript
// ❌ BAD
class PetService {
  private api = new FetchApiClient() // Tightly coupled

  async generate(prompt: string) {
    return this.api.post('/pets', { prompt })
  }
}

// ✅ GOOD - Dependency Injection
class PetService {
  constructor(private api: IApiClient) {} // Loose coupling

  async generate(prompt: string) {
    return this.api.post('/pets', { prompt })
  }
}
```

### 12.7 ❌ Not Handling Errors

**Problem**: Silent failures, no user feedback

```typescript
// ❌ BAD
async function generatePet(prompt: string) {
  const pet = await api.generatePet(prompt)
  return pet
}

// ✅ GOOD
async function generatePet(prompt: string) {
  try {
    const pet = await api.generatePet(prompt)
    return { success: true, data: pet }
  } catch (error) {
    logger.error('Failed to generate pet', error, { prompt })

    if (error instanceof RateLimitError) {
      showError('You have reached your daily limit')
    } else {
      showError('Failed to generate pet. Please try again.')
    }

    return { success: false, error }
  }
}
```

### 12.8 ❌ Ignoring Memory Leaks

**Problem**: Event listeners, intervals, subscriptions not cleaned up

```typescript
// ❌ BAD
function PetWidget() {
  useEffect(() => {
    const interval = setInterval(() => {
      updatePetState()
    }, 1000)
    // Missing cleanup!
  }, [])
}

// ✅ GOOD
function PetWidget() {
  useEffect(() => {
    const interval = setInterval(() => {
      updatePetState()
    }, 1000)

    return () => clearInterval(interval) // Cleanup
  }, [])
}
```

---

## 13. Future Roadmap

### Phase 1: MVP (Months 1-2)
- ✅ Core pet generation (5 states)
- ✅ Basic page classification (URL patterns)
- ✅ Google OAuth login
- ✅ Simple focus timer
- ✅ Daily activity report
- ✅ Chrome extension (Manifest V3)

### Phase 2: Enhanced Features (Months 3-4)
- 🔲 AI-powered page classification
- 🔲 Animated GIF pets (text-to-video)
- 🔲 Advanced focus modes (Pomodoro, custom)
- 🔲 Weekly/monthly reports
- 🔲 Achievement system
- 🔲 Pet customization (accessories, colors)

### Phase 3: Engagement (Months 5-6)
- 🔲 Pet behaviors (sleeping, eating, playing)
- 🔲 Context-aware conversations
- 🔲 Mood tracking integration
- 🔲 Social sharing (pet showcase)
- 🔲 Multi-device sync (mobile app?)

### Phase 4: Monetization (Months 7+)
- 🔲 Premium subscription ($4.99/mo)
  - Unlimited generations
  - Exclusive pet styles
  - Advanced analytics
  - Priority support
- 🔲 Marketplace (community pet designs)
- 🔲 Team/organization features

### Technical Improvements
- 🔲 WebSocket for real-time sync
- 🔲 Edge computing (CloudFront Functions)
- 🔲 Machine learning for better classification
- 🔲 Browser extension for Firefox, Edge, Safari
- 🔲 Accessibility improvements (WCAG 2.1 AA)
- 🔲 Internationalization (i18n)

---

## Conclusion

This architecture is designed for:

✅ **Scalability**: Serverless backend auto-scales, frontend is optimized
✅ **Maintainability**: Clean separation of concerns, modular design
✅ **Performance**: <100ms response times, offline-first
✅ **Security**: OAuth 2.0, encryption, zero-trust
✅ **Reliability**: Error handling, retry logic, monitoring

The system follows industry-standard patterns (Repository, Strategy, Observer, DI) and avoids common anti-patterns (God Object, Prop Drilling, Tight Coupling).

Ready for MVP development! 🚀

---

## Appendix

### A. Glossary
- **Service Worker**: Background script in Chrome extension
- **Content Script**: Script injected into web pages
- **Manifest V3**: Latest Chrome extension API
- **Single-Table Design**: DynamoDB pattern using one table
- **Offline-First**: App works without internet, syncs later

### B. References
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [WXT Framework](https://wxt.dev/)
- [AWS CDK](https://docs.aws.amazon.com/cdk/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [React Performance](https://react.dev/learn/render-and-commit)

### C. Team Contacts
- Product: @kaitong
- Backend: TBD
- Frontend: TBD
- DevOps: TBD
