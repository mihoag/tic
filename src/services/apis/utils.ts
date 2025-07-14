import { ApiResponse, ApiError } from '../../types';

// Utility functions for API operations
export class ApiUtils {
  /**
   * Handle API errors consistently across the application
   */
  static handleApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message, 0, 'UNKNOWN_ERROR');
    }

    return new ApiError('An unexpected error occurred', 0, 'UNKNOWN_ERROR');
  }

  /**
   * Create query string from object parameters
   */
  static createQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Format date for API requests
   */
  static formatDateForApi(date: Date | string): string {
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return date.toISOString();
  }

  /**
   * Parse date from API response
   */
  static parseDateFromApi(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Check if response is successful
   */
  static isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
    return response.success;
  }

  /**
   * Extract data from successful response
   */
  static extractData<T>(response: ApiResponse<T>): T {
    if (!ApiUtils.isSuccessResponse(response)) {
      throw new ApiError(response.message || 'API request failed', 0, 'API_ERROR');
    }
    return response.data;
  }

  /**
   * Retry mechanism for API calls
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          break;
        }

        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          break;
        }

        await ApiUtils.delay(delay * attempt);
      }
    }

    throw lastError!;
  }

  /**
   * Delay utility for retry mechanism
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform form data to API format
   */
  static transformFormData(formData: FormData): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(data[key])) {
          (data[key] as unknown[]).push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Validate required fields in request data
   */
  static validateRequiredFields(
    data: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new ApiError(
        `Missing required fields: ${missingFields.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Clean undefined values from objects
   */
  static cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if URL is absolute
   */
  static isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }

  /**
   * Build full URL
   */
  static buildUrl(baseUrl: string, endpoint: string): string {
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }
}

// Export commonly used utility functions
export const {
  handleApiError,
  createQueryString,
  formatDateForApi,
  parseDateFromApi,
  isSuccessResponse,
  extractData,
  retry,
  validateRequiredFields,
  cleanObject
} = ApiUtils;
