/**
 * API Client
 */

import type { ApiResponse, ApiError } from '@shared/types'
import { ErrorCode } from '@shared/constants/errors'
import { CONFIG } from '../config'

export class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        const error: ApiError = {
          code: this.mapStatusToErrorCode(response.status),
          message: data.error?.message || response.statusText,
          details: data.error?.details,
        }

        return {
          success: false,
          error,
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 401:
        return ErrorCode.UNAUTHORIZED
      case 403:
        return ErrorCode.FORBIDDEN
      case 404:
        return ErrorCode.NOT_FOUND
      case 429:
        return ErrorCode.RATE_LIMIT_EXCEEDED
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE
      default:
        return status >= 500
          ? ErrorCode.INTERNAL_ERROR
          : ErrorCode.VALIDATION_ERROR
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
