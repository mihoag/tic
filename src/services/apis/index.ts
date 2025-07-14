// Re-export all API services for clean imports
export {
  ActivityService,
  UserService,
  BadgeService,
  AuthService,
  OrganizationService,
  OrganizationAdminService,
  HealthService,
  ApiClient,
  ApiError,
  activityService,
  userService,
  badgeService,
  authService,
  organizationService,
  organizationAdminService,
  healthService
} from '../apiService';

// Export utility functions
export {
  ApiUtils,
  handleApiError,
  createQueryString,
  formatDateForApi,
  parseDateFromApi,
  isSuccessResponse,
  extractData,
  retry,
  validateRequiredFields,
  cleanObject
} from './utils';

// Export types for API usage
export type {
  Activity,
  User,
  Badge,
  Organization,
  IssuedBadge,
  ActivityParticipation,
  OrganizationAdmin,
  UserBadgeProgress,
  BadgeView,
  PaginatedResponse,
  ActivityFilter,
  BadgeFilter,
  UserFilter,
  ActivityStats,
  OrganizationStats,
  UserStats,
  LeaderboardEntry,
  ApiResponse,
  GamificationData
} from '../../types';

// API Endpoints Documentation
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: '/health',

  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification'
  },

  // Users
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BADGES: (userId: string) => `/users/${userId}/badges`,
    ACTIVITIES: (userId: string) => `/users/${userId}/activities`,
    STATS: (userId: string) => `/users/${userId}/stats`,
    BADGE_PROGRESS: (userId: string, badgeId: string) => `/users/${userId}/badges/${badgeId}/progress`
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: '/organizations',
    BY_ID: (id: string) => `/organizations/${id}`,
    STATS: (id: string) => `/organizations/${id}/stats`,
    ACTIVITIES: (id: string) => `/organizations/${id}/activities`,
    BADGES: (id: string) => `/organizations/${id}/badges`,
    MEMBERS: (id: string) => `/organizations/${id}/members`,
    ADMINS: {
      LIST: (orgId: string) => `/organizations/${orgId}/admins`,
      BY_ID: (orgId: string, userId: string) => `/organizations/${orgId}/admins/${userId}`,
      PERMISSIONS: (orgId: string, userId: string) => `/organizations/${orgId}/admins/${userId}/permissions`
    }
  },

  // Activities
  ACTIVITIES: {
    LIST: '/activities',
    BY_ID: (id: string) => `/activities/${id}`,
    JOIN: (id: string) => `/activities/${id}/join`,
    LEAVE: (id: string) => `/activities/${id}/leave`,
    PARTICIPANTS: (id: string) => `/activities/${id}/participants`,
    PARTICIPANT: (activityId: string, participationId: string) => 
      `/activities/${activityId}/participants/${participationId}`,
    STATS: (id: string) => `/activities/${id}/stats`
  },

  // Badges
  BADGES: {
    LIST: '/badges',
    BY_ID: (id: string) => `/badges/${id}`,
    ISSUE: (id: string) => `/badges/${id}/issue`,
    VERIFY: (code: string) => `/badges/verify/${code}`,
    ISSUED: {
      LIST: '/issued-badges',
      BY_ID: (id: string) => `/issued-badges/${id}`,
      REVOKE: (id: string) => `/issued-badges/${id}/revoke`,
      VIEW: (id: string) => `/issued-badges/${id}/view`
    }
  },

  // Leaderboard
  LEADERBOARD: '/leaderboard'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API Error Codes
export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

// Default API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;
