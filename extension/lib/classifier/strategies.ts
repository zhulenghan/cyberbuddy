/**
 * Page classification strategies
 */

import type { ActivityLabel, PageContext, ClassificationResult } from '@shared/types'
import { URL_PATTERNS, KEYWORDS } from '@shared/constants/labels'

export interface IClassificationStrategy {
  classify(page: PageContext): ClassificationResult | Promise<ClassificationResult>
}

/**
 * Strategy 1: URL Pattern Matching (Fastest, ~1ms)
 */
export class URLPatternStrategy implements IClassificationStrategy {
  classify(page: PageContext): ClassificationResult {
    const url = page.url.toLowerCase()

    for (const [label, patterns] of Object.entries(URL_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return {
            label: label as ActivityLabel,
            confidence: 0.9,
          }
        }
      }
    }

    return {
      label: 'other' as ActivityLabel,
      confidence: 0.5,
    }
  }
}

/**
 * Strategy 2: Keyword Analysis (Medium, ~10ms)
 */
export class KeywordStrategy implements IClassificationStrategy {
  classify(page: PageContext): ClassificationResult {
    const text = `${page.title} ${page.content || ''}`.toLowerCase()
    const scores = new Map<ActivityLabel, number>()

    // Count keyword matches for each label
    for (const [label, keywords] of Object.entries(KEYWORDS)) {
      let score = 0
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          score += matches.length
        }
      }
      scores.set(label as ActivityLabel, score)
    }

    // Find label with highest score
    let maxScore = 0
    let topLabel: ActivityLabel = 'other'

    for (const [label, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score
        topLabel = label
      }
    }

    // Normalize confidence (cap at 0.95)
    const confidence = Math.min(0.95, maxScore / 10)

    return {
      label: topLabel,
      confidence,
    }
  }
}

/**
 * Strategy 3: Combined Strategy
 * Uses URL pattern first, falls back to keywords
 */
export class CombinedStrategy implements IClassificationStrategy {
  private urlStrategy = new URLPatternStrategy()
  private keywordStrategy = new KeywordStrategy()

  classify(page: PageContext): ClassificationResult {
    // Try URL pattern first
    const urlResult = this.urlStrategy.classify(page)

    // If confident enough, return URL result
    if (urlResult.confidence >= 0.8) {
      return urlResult
    }

    // Otherwise, use keyword analysis
    const keywordResult = this.keywordStrategy.classify(page)

    // Return the one with higher confidence
    return keywordResult.confidence > urlResult.confidence
      ? keywordResult
      : urlResult
  }
}
