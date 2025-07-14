import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
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
  ApiError,
  GamificationData,
  OrganizationFilter,
} from "../types";
import { act } from "react";
// Add new response type for getActivity
export interface ActivityDetailResponse {
  activity: Activity & {
    Organization: Organization & {
      Owner: User;
      Admins: OrganizationAdmin[] | null;
      Badges: Badge[] | null;
    };
    Badge: Badge | null;
    Participations: ActivityParticipation[] | null;
  };
  badge: Badge & {
    Organization: Organization & {
      Owner: User;
      Admins: OrganizationAdmin[] | null;
      Badges: Badge[] | null;
    };
    IssuedBadges: IssuedBadge[] | null;
    Activities: Activity[] | null;
    Progress: UserBadgeProgress[] | null;
  } | null;
  organization: Organization & {
    Owner: User;
    Admins: OrganizationAdmin[] | null;
    Badges: Badge[] | null;
  };
  participations: ActivityParticipation[] | null;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = "") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add the Authorization header
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.message ||
            `HTTP ${error.response.status}: ${error.response.statusText}`;
          const errorCode = error.response.data?.code || "HTTP_ERROR";
          throw new ApiError(errorMessage, error.response.status, errorCode);
        } else if (error.request) {
          // Network error
          throw new ApiError(
            "Network error: Unable to connect to server. Please check your internet connection.",
            0,
            "NETWORK_ERROR"
          );
        } else {
          // Other error
          throw new ApiError(
            error.message || "An unexpected error occurred",
            0,
            "UNKNOWN_ERROR"
          );
        }
      }
    );
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.client.get(endpoint);
    return {
      data: response.data,
      success: true,
      message: response.data.message || "Success",
    };
  }

  public async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | object
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(endpoint, data);
    return {
      data: response.data,
      success: true,
      message: response.data.message || "Success",
    };
  }

  public async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | object
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put(endpoint, data);
    return {
      data: response.data,
      success: true,
      message: response.data.message || "Success",
    };
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(endpoint);
    return {
      data: response.data,
      success: true,
      message: response.data.message || "Success",
    };
  }
}

// Activity Service
export class ActivityService {
  constructor(private apiClient: ApiClient) {}

  async getActivities(
    filter?: ActivityFilter
  ): Promise<ApiResponse<Activity[]>> {
    const params = new URLSearchParams();
    if (filter?.org_id) params.append("org_id", filter.org_id);
    if (filter?.user_id) params.append("org_id", filter.user_id);
    if (filter?.badge_def_id)
      params.append("badge_def_id", filter.badge_def_id);
    if (filter?.status) params.append("status", filter.status);
    if (filter?.start_date_from)
      params.append("start_date_from", filter.start_date_from);
    if (filter?.start_date_to)
      params.append("start_date_to", filter.start_date_to);
    if (filter?.search) params.append("search", filter.search);

    const query = params.toString();
    return this.apiClient.get<Activity[]>(
      `/activities${query ? `?${query}` : ""}`
    );
  }

  

 async getActivity(id: string): Promise<ApiResponse<ActivityDetailResponse>> {
  return this.apiClient.get<ActivityDetailResponse>(`/activities/${id}`);
}

  async createActivity(
    orgId: string,
    activity: Omit<
      Activity,
      "activity_id" | "created_at" | "updated_at" | "org_id"
    >
  ): Promise<ApiResponse<Activity>> {
    return this.apiClient.post<Activity>(
      `/organizations/${orgId}/activities`,
      activity
    );
  }

  async updateActivity(
    id: string,
    activity: Partial<Activity>
  ): Promise<ApiResponse<Activity>> {
    return this.apiClient.put<Activity>(`/activities/${id}`, activity);
  }

  async deleteActivity(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/activities/${id}`);
  }

  async joinActivity(
    activityId: string, userId: string
  ): Promise<ApiResponse<ActivityParticipation>> {
    return this.apiClient.post<ActivityParticipation>(
      `/activities/${activityId}/participations`,
      { user_id: userId ,activity_id: activityId}
    );
  }

  async leaveActivity(
    activityId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.post<{ success: boolean }>(
      `/activities/${activityId}/leave`
    );
  }

  async getActivityParticipants(
    activityId: string
  ): Promise<ApiResponse<PaginatedResponse<ActivityParticipation>>> {
    return this.apiClient.get<PaginatedResponse<ActivityParticipation>>(
      `/activities/${activityId}/participants`
    );
  }

  async updateParticipationStatus(
    activityId: string,
    participationId: string,
    status: "registered" | "attended" | "completed",
    proofUrl?: string
  ): Promise<ApiResponse<ActivityParticipation>> {
    return this.apiClient.put<ActivityParticipation>(
      `/activities/${activityId}/participants/${participationId}`,
      {
        status,
        proof_of_participation_url: proofUrl,
      }
    );
  }

  async getActivityStats(
    activityId: string
  ): Promise<ApiResponse<ActivityStats>> {
    return this.apiClient.get<ActivityStats>(`/activities/${activityId}/stats`);
  }
}

// User Service
export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getProfile(): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>("/auth/profile");
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>("/auth/profile", userData);
  }

  async getUsers(
    filter?: UserFilter
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    if (filter?.role) params.append("role", filter.role);
    if (filter?.privacy_setting)
      params.append("privacy_setting", filter.privacy_setting);
    if (filter?.search) params.append("search", filter.search);

    const query = params.toString();
    return this.apiClient.get<PaginatedResponse<User>>(
      `/users${query ? `?${query}` : ""}`
    );
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async createUser(
    userData: Omit<User, "user_id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>("/users", userData);
  }

  async updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }

  async getUserActivities(
    userId: string
  ): Promise<ApiResponse<PaginatedResponse<ActivityParticipation>>> {
    return this.apiClient.get<PaginatedResponse<ActivityParticipation>>(
      `/users/${userId}/activities`
    );
  }

  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.apiClient.get<UserStats>(`/users/${userId}/stats`);
  }

  async getLeaderboard(
    orgId?: string
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    const params = orgId ? `?org_id=${orgId}` : "";
    return this.apiClient.get<LeaderboardEntry[]>(`/leaderboard${params}`);
  }

  async updateGamificationData(
    data: GamificationData
  ): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>("/user/gamification", data);
  }
}

// Badge Service
export class BadgeService {
  constructor(private apiClient: ApiClient) {}

  async getBadges(
    filter?: BadgeFilter
  ): Promise<ApiResponse<Badge[]>> {
    const params = new URLSearchParams();
    if (filter?.org_id) params.append("org_id", filter.org_id);
    if (filter?.badge_type) params.append("badge_type", filter.badge_type);
    if (filter?.is_active !== undefined)
      params.append("is_active", filter.is_active.toString());
    if (filter?.search) params.append("search", filter.search);
    if (filter?.user_id) params.append("user_id", filter.user_id);

    const query = params.toString();
    return this.apiClient.get<Badge[]>(
      `/badges${query ? `?${query}` : ""}`
    );
  }

  async getBadge(id: string): Promise<ApiResponse<Badge>> {
    return this.apiClient.get<Badge>(`/badges/${id}`);
  }

  async createBadge(
    orgId: string,
    badge: Omit<Badge, "badge_def_id" | "created_at" | "updated_at" | "org_id">
  ): Promise<ApiResponse<Badge>> {
    return this.apiClient.post<Badge>(`/organizations/${orgId}/badges`, badge);
  }

  async updateBadge(
    id: string,
    badge: Partial<Badge>
  ): Promise<ApiResponse<Badge>> {
    return this.apiClient.put<Badge>(`/badges/${id}`, badge);
  }

  async deleteBadge(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/badges/${id}`);
  }

  async issueBadge(
    badgeId: string,
    userId: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse<IssuedBadge>> {
    return this.apiClient.post<IssuedBadge>(`/badges/${badgeId}/issue`, {
      user_id: userId,
      additional_data: data || {},
    });
  }

  async revokeBadge(
    issuedBadgeId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.put<{ success: boolean }>(
      `/issued-badges/${issuedBadgeId}/revoke`,
      {}
    );
  }

  async getIssuedBadges(filter?: {
    user_id?: string;
    org_id?: string;
    badge_def_id?: string;
  }): Promise<ApiResponse<PaginatedResponse<IssuedBadge>>> {
    const params = new URLSearchParams();
    if (filter?.user_id) params.append("user_id", filter.user_id);
    if (filter?.org_id) params.append("org_id", filter.org_id);
    if (filter?.badge_def_id)
      params.append("badge_def_id", filter.badge_def_id);

    const query = params.toString();
    return this.apiClient.get<PaginatedResponse<IssuedBadge>>(
      `/issued-badges${query ? `?${query}` : ""}`
    );
  }

  async getIssuedBadge(id: string): Promise<ApiResponse<IssuedBadge>> {
    return this.apiClient.get<IssuedBadge>(`/issued-badges/${id}`);
  }

  async verifyBadge(
    verificationCode: string
  ): Promise<ApiResponse<IssuedBadge>> {
    return this.apiClient.get<IssuedBadge>(
      `/badges/verify/${verificationCode}`
    );
  }

  async getBadgeProgress(
    userId: string,
    badgeId: string
  ): Promise<ApiResponse<UserBadgeProgress>> {
    return this.apiClient.get<UserBadgeProgress>(
      `/users/${userId}/badges/${badgeId}/progress`
    );
  }

  async updateBadgeProgress(
    userId: string,
    badgeId: string,
    progress: number,
    unit?: string
  ): Promise<ApiResponse<UserBadgeProgress>> {
    return this.apiClient.put<UserBadgeProgress>(
      `/users/${userId}/badges/${badgeId}/progress`,
      {
        progress_value: progress,
        unit,
      }
    );
  }

  async recordBadgeView(
    issuedBadgeId: string
  ): Promise<ApiResponse<BadgeView>> {
    return this.apiClient.post<BadgeView>(
      `/issued-badges/${issuedBadgeId}/view`
    );
  }
}

// Organization Service
export class OrganizationService {
  constructor(private apiClient: ApiClient) {}

  async getOrganizations(
    filter: OrganizationFilter
  ): Promise<ApiResponse<Organization[]>> {
    const params = new URLSearchParams();
    if (filter?.user_id) params.append("user_id", filter.user_id);
    const query = params.toString();
    return this.apiClient.get<Organization[]>(`/organizations?${query ? query : ""}`);
  }

  async getOrganization(id: string): Promise<ApiResponse<Organization>> {
    return this.apiClient.get<Organization>(`/organizations/${id}`);
  }

  async createOrganization(
    orgData: Omit<Organization, "org_id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<Organization>> {
    return this.apiClient.post<Organization>("/organizations", orgData);
  }

  async updateOrganization(
    id: string,
    adminId: string,
    orgData: Partial<Organization>
  ): Promise<ApiResponse<Organization>> {
    return this.apiClient.put<Organization>(`/organizations/${id}/admins/${adminId}`, orgData);
  }

  async deleteOrganization(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/organizations/${id}`);
  }

  async getOrganizationStats(
    id: string
  ): Promise<ApiResponse<OrganizationStats>> {
    return this.apiClient.get<OrganizationStats>(`/organizations/${id}/stats`);
  }

  async getOrganizationActivities(
    id: string
  ): Promise<ApiResponse<PaginatedResponse<Activity>>> {
    return this.apiClient.get<PaginatedResponse<Activity>>(
      `/organizations/${id}/activities`
    );
  }

  async getOrganizationBadges(
    id: string
  ): Promise<ApiResponse<PaginatedResponse<Badge>>> {
    return this.apiClient.get<PaginatedResponse<Badge>>(
      `/organizations/${id}/badges`
    );
  }

  async getOrganizationMembers(
    id: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.apiClient.get<PaginatedResponse<User>>(
      `/organizations/${id}/members`
    );
  }
}

// Organization Admin Service
export class OrganizationAdminService {
  constructor(private apiClient: ApiClient) {}

  async getAdmins(
    orgId: string
  ): Promise<ApiResponse<PaginatedResponse<OrganizationAdmin>>> {
    return this.apiClient.get<PaginatedResponse<OrganizationAdmin>>(
      `/organizations/${orgId}/admins`
    );
  }

  async createAdmin(
    orgId: string,
    adminData: {
      user_id: string;
      role: string;
    }
  ): Promise<ApiResponse<OrganizationAdmin>> {
    return this.apiClient.post<OrganizationAdmin>(
      `/organizations/${orgId}/admins`,
      adminData
    );
  }

  async updateAdmin(
    orgId: string,
    userId: string,
    role: string
  ): Promise<ApiResponse<OrganizationAdmin>> {
    return this.apiClient.put<OrganizationAdmin>(
      `/organizations/${orgId}/admins/${userId}`,
      { role }
    );
  }

  async deleteAdmin(orgId: string, userId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(
      `/organizations/${orgId}/admins/${userId}`
    );
  }

  async getAdminPermissions(
    orgId: string,
    userId: string
  ): Promise<ApiResponse<{ permissions: string[] }>> {
    return this.apiClient.get<{ permissions: string[] }>(
      `/organizations/${orgId}/admins/${userId}/permissions`
    );
  }
}

// Health Check Service
export class HealthService {
  constructor(private apiClient: ApiClient) {}

  async getHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.apiClient.get<{ status: string; timestamp: string }>("/health");
  }
}

// Auth Service
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.apiClient.post<{ token: string; user: User }>(
      "/auth/login",
      {
        email,
        password,
      }
    );

    if (response.success && response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    role?: "USER" | "ORGANIZER";
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.apiClient.post<{ token: string; user: User }>(
      "/auth/register",
      userData
    );

    if (response.success && response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.apiClient.post<{ token: string }>("/auth/refresh");
  }

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.post<{ success: boolean }>("/auth/forgot-password", {
      email,
    });
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.post<{ success: boolean }>("/auth/reset-password", {
      token,
      password,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.put<{ success: boolean }>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.post<{ success: boolean }>("/auth/verify-email", {
      token,
    });
  }

  async resendVerification(
    email: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.post<{ success: boolean }>(
      "/auth/resend-verification",
      { email }
    );
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pingbadge.tranvu.info/api/v1";

// Export singleton instances
const apiClient = new ApiClient(API_BASE_URL);
export const activityService = new ActivityService(apiClient);
export const userService = new UserService(apiClient);
export const badgeService = new BadgeService(apiClient);
export const authService = new AuthService(apiClient);
export const organizationService = new OrganizationService(apiClient);
export const organizationAdminService = new OrganizationAdminService(apiClient);
export const healthService = new HealthService(apiClient);

export { ApiClient, ApiError };
