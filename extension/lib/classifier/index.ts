/**
 * Page classifier
 */

import type { ActivityLabel, PageContext, ClassificationResult } from '@shared/types'
import {
  IClassificationStrategy,
  URLPatternStrategy,
  KeywordStrategy,
  CombinedStrategy,
} from './strategies'

export class PageClassifier {
  private strategies: IClassificationStrategy[]
  private cache = new Map<string, ClassificationResult>()
  private cacheSize = 500

  constructor(strategies?: IClassificationStrategy[]) {
    this.strategies = strategies || [new CombinedStrategy()]
  }

  /**
   * Classify a page
   */
  async classify(page: PageContext): Promise<ActivityLabel> {
    const cacheKey = this.getCacheKey(page)

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached.label
    }

    // Try each strategy in order
    for (const strategy of this.strategies) {
      const result = await strategy.classify(page)

      // If confident enough, cache and return
      if (result.confidence >= 0.7) {
        this.addToCache(cacheKey, result)
        return result.label
      }
    }

    // Default to 'other'
    const defaultResult: ClassificationResult = {
      label: 'other',
      confidence: 0.5,
    }

    this.addToCache(cacheKey, defaultResult)
    return defaultResult.label
  }

  /**
   * Generate cache key from page context
   */
  private getCacheKey(page: PageContext): string {
    // Use URL + title for cache key
    return `${page.url}:${page.title}`
  }

  /**
   * Add result to cache (with size limit)
   */
  private addToCache(key: string, result: ClassificationResult): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, result)
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.cacheSize,
    }
  }
}

// Export strategies
export * from './strategies'

// Export singleton instance
export const pageClassifier = new PageClassifier()
