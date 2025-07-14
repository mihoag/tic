// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'USER' | 'ORGANIZER';
}

export interface CreateActivityRequest {
  activity_name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  badge_def_id?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
  privacy_setting?: 'public' | 'friends_only' | 'private';
}

// Filter and Sort Types
export interface ActivityFilters {
  status?: 'upcoming' | 'ongoing' | 'past';
  organization?: string;
  hasBadge?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
