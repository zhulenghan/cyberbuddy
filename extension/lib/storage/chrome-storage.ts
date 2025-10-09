/**
 * Chrome Storage API wrapper
 */

export class ChromeStorage {
  /**
   * Get item from chrome.storage.local
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await chrome.storage.local.get(key)
      return result[key] as T | undefined
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error)
      return undefined
    }
  }

  /**
   * Get multiple items from chrome.storage.local
   */
  async getMultiple<T extends Record<string, any>>(
    keys: string[]
  ): Promise<Partial<T>> {
    try {
      const result = await chrome.storage.local.get(keys)
      return result as Partial<T>
    } catch (error) {
      console.error('Failed to get multiple items from storage:', error)
      return {}
    }
  }

  /**
   * Set item in chrome.storage.local
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error)
      throw error
    }
  }

  /**
   * Set multiple items in chrome.storage.local
   */
  async setMultiple(items: Record<string, any>): Promise<void> {
    try {
      await chrome.storage.local.set(items)
    } catch (error) {
      console.error('Failed to set multiple items in storage:', error)
      throw error
    }
  }

  /**
   * Remove item from chrome.storage.local
   */
  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key)
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error)
      throw error
    }
  }

  /**
   * Remove multiple items from chrome.storage.local
   */
  async removeMultiple(keys: string[]): Promise<void> {
    try {
      await chrome.storage.local.remove(keys)
    } catch (error) {
      console.error('Failed to remove multiple items from storage:', error)
      throw error
    }
  }

  /**
   * Clear all items from chrome.storage.local
   */
  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
      throw error
    }
  }

  /**
   * Get all items from chrome.storage.local
   */
  async getAll(): Promise<Record<string, any>> {
    try {
      return await chrome.storage.local.get(null)
    } catch (error) {
      console.error('Failed to get all items from storage:', error)
      return {}
    }
  }

  /**
   * Listen for storage changes
   */
  onChange(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        callback(changes)
      }
    })
  }
}

export const chromeStorage = new ChromeStorage()
