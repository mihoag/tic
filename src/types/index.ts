// Core Entity Types - Based on Backend Go Models
export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash?: string; // Optional for frontend use
  full_name?: string;
  profile_picture_url?: string;
  bio?: string;
  role: "USER" | "ORGANIZER";
  privacy_setting: "public" | "friends_only" | "private";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Organization {
  org_id: string;
  org_name: string;
  org_email: string;
  org_logo_url?: string;
  user_id_owner: string;
  description?: string;
  website_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Badge {
  badge_def_id: string;
  org_id: string;
  badge_name: string;
  description?: string;
  image_url: string;
  criteria?: string;
  badge_type: string;
  rule_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface IssuedBadge {
  issued_badge_id: string;
  badge_def_id: string;
  user_id: string;
  org_id: string;
  issue_date: string;
  verification_code: string;
  source_type?: string;
  source_id?: string;
  cumulative_progress_at_issuance?: number;
  cumulative_unit?: string;
  additional_data: Record<string, unknown>;
  status: "issued" | "revoked";
  blockchain_tx_id?: string;
  // Relations (populated when needed)
  badge?: Badge;
  organization?: Organization;
  user?: User;
}

export interface Activity {
  activity_id: string;
  org_id: string;
  activity_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  badge_def_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Relations (populated when needed)
  organization?: Organization;
  badge?: Badge;
  participants?: ActivityParticipation[];
  participant_count?: number;
}

export interface ActivityParticipation {
  participation_id: string;
  activity_id: string;
  user_id: string;
  status: "REGISTER" | "NOT_COMPLETED" | "PENDING" | "COMPLETED";
  proof_of_participation_url?: string;
  issued_badge_id?: string;
  created_at: string;
  // Relations (populated when needed)
  activity?: Activity;
  user?: User;
  issued_badge?: IssuedBadge;
}

export interface OrganizationAdmin {
  admin_id: string;
  org_id: string;
  user_id: string;
  role: string;
  created_at: string;
  // Relations (populated when needed)
  organization?: Organization;
  user?: User;
}

export interface UserBadgeProgress {
  progress_id: string;
  user_id: string;
  badge_def_id: string;
  progress_value: number;
  unit?: string;
  is_qualified: boolean;
  last_updated: string;
  // Relations (populated when needed)
  user?: User;
  badge?: Badge;
}

export interface BadgeView {
  view_id: string;
  issued_badge_id: string;
  viewer_ip_address?: string;
  view_timestamp: string;
  // Relations (populated when needed)
  issued_badge?: IssuedBadge;
}

// Utility Types
export type EntityStatus = "active" | "inactive" | "deleted";
export type ParticipationStatus = "registered" | "attended" | "completed";
export type BadgeStatus = "issued" | "revoked";
export type UserRole = "USER" | "ORGANIZER";
export type PrivacySetting = "public" | "friends_only" | "private";

// API Response Types
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Search and Filter Types
export interface ActivityFilter {
  user_id?: string;
  org_id?: string;
  badge_def_id?: string;
  status?: "upcoming" | "ongoing" | "past";
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
}

export interface BadgeFilter {
  user_id?: string;
  org_id?: string;
  badge_type?: string;
  is_active?: boolean;
  search?: string;
}

export interface UserFilter {
  role?: UserRole;
  privacy_setting?: PrivacySetting;
  search?: string;
}

export interface OrganizationFilter {
  user_id?: string;
}

// Statistics Types
export interface ActivityStats {
  total_participants: number;
  completed_participants: number;
  badges_issued: number;
  completion_rate: number;
}

export interface OrganizationStats {
  total_activities: number;
  total_badges: number;
  total_participants: number;
  active_activities: number;
}

export interface UserStats {
  activities_joined: number;
  badges_earned: number;
  completion_rate: number;
  current_level?: number;
  total_points?: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  user: User;
  score: number;
  rank: number;
  badges_count: number;
  activities_completed: number;
}

// Export all types from other modules
export * from "./api";
export * from "./gamification";
// export * from './ui'; // Temporarily commented out
