/**
 * IndexedDB wrapper for large data storage
 */

import type { Activity, Pet } from '@shared/types'

const DB_NAME = 'CyberBuddyDB'
const DB_VERSION = 1

export interface ImageRecord {
  id: string
  blob: Blob
  url?: string
  createdAt: number
}

export class IndexedDB {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize database
   */
  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Activities store
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', {
            keyPath: 'id',
            autoIncrement: true,
          })
          activitiesStore.createIndex('date', 'date', { unique: false })
          activitiesStore.createIndex('label', 'label', { unique: false })
          activitiesStore.createIndex('url', 'url', { unique: false })
        }

        // Pets store
        if (!db.objectStoreNames.contains('pets')) {
          db.createObjectStore('pets', { keyPath: 'id' })
        }

        // Images store (for caching pet images)
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'id' })
          imagesStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInit(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Failed to initialize database')
    }
    return this.db
  }

  // ========== Activities ==========

  /**
   * Save activity
   */
  async saveActivity(activity: Activity): Promise<void> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('activities', 'readwrite')
      const store = tx.objectStore('activities')
      const request = store.add(activity)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get activities by date range
   */
  async getActivitiesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Activity[]> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('activities', 'readonly')
      const store = tx.objectStore('activities')
      const index = store.index('date')
      const range = IDBKeyRange.bound(startDate, endDate)
      const request = index.getAll(range)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get activities by date
   */
  async getActivitiesByDate(date: string): Promise<Activity[]> {
    return this.getActivitiesByDateRange(date, date)
  }

  /**
   * Delete old activities (older than N days)
   */
  async deleteOldActivities(daysToKeep: number): Promise<void> {
    const db = await this.ensureInit()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffString = cutoffDate.toISOString().split('T')[0]

    return new Promise((resolve, reject) => {
      const tx = db.transaction('activities', 'readwrite')
      const store = tx.objectStore('activities')
      const index = store.index('date')
      const range = IDBKeyRange.upperBound(cutoffString, true)
      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  // ========== Pets ==========

  /**
   * Save pet
   */
  async savePet(pet: Pet): Promise<void> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pets', 'readwrite')
      const store = tx.objectStore('pets')
      const request = store.put(pet)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get pet by ID
   */
  async getPet(id: string): Promise<Pet | undefined> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pets', 'readonly')
      const store = tx.objectStore('pets')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all pets
   */
  async getAllPets(): Promise<Pet[]> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pets', 'readonly')
      const store = tx.objectStore('pets')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete pet
   */
  async deletePet(id: string): Promise<void> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pets', 'readwrite')
      const store = tx.objectStore('pets')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ========== Images ==========

  /**
   * Save image blob
   */
  async saveImage(id: string, blob: Blob): Promise<void> {
    const db = await this.ensureInit()
    const record: ImageRecord = {
      id,
      blob,
      url: URL.createObjectURL(blob),
      createdAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('images', 'readwrite')
      const store = tx.objectStore('images')
      const request = store.put(record)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get image blob
   */
  async getImage(id: string): Promise<ImageRecord | undefined> {
    const db = await this.ensureInit()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('images', 'readonly')
      const store = tx.objectStore('images')
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result
        // Recreate object URL if needed
        if (result && !result.url) {
          result.url = URL.createObjectURL(result.blob)
        }
        resolve(result)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete image
   */
  async deleteImage(id: string): Promise<void> {
    const db = await this.ensureInit()
    // Revoke object URL if exists
    const image = await this.getImage(id)
    if (image?.url) {
      URL.revokeObjectURL(image.url)
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('images', 'readwrite')
      const store = tx.objectStore('images')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureInit()
    const storeNames = ['activities', 'pets', 'images']

    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }
}

export const indexedDBStorage = new IndexedDB()
