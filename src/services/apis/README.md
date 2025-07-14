# API Service Documentation

This document provides comprehensive information about the API service implementation for the Ping Badge Frontend application.

## Overview

The API service provides a complete interface to interact with the Ping Badge backend API. It includes all endpoints from the Postman collection and follows TypeScript best practices with full type safety.

## Architecture

### Core Components

1. **ApiClient**: Base HTTP client with authentication and error handling
2. **Service Classes**: Domain-specific API services
3. **Type Definitions**: Full TypeScript types matching backend Go models
4. **Utilities**: Helper functions for common API operations

### Services Available

- `ActivityService`: Manage activities and participation
- `UserService`: User management and profiles
- `BadgeService`: Badge creation, issuance, and verification
- `AuthService`: Authentication and authorization
- `OrganizationService`: Organization management
- `OrganizationAdminService`: Admin role management
- `HealthService`: System health checks

## Usage Examples

### Authentication

```typescript
import { authService } from '@/services/apis';

// Login
const loginResponse = await authService.login('user@example.com', 'password');
if (loginResponse.success) {
  console.log('User:', loginResponse.data.user);
  console.log('Token:', loginResponse.data.token);
}

// Register
const registerResponse = await authService.register({
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123',
  full_name: 'New User',
  role: 'USER'
});

// Get current profile
const profile = await authService.getProfile();
```

### Activity Management

```typescript
import { activityService } from '@/services/apis';

// Get activities with filters
const activities = await activityService.getActivities({
  org_id: 'org-123',
  status: 'upcoming',
  search: 'workshop'
});

// Create new activity
const newActivity = await activityService.createActivity('org-123', {
  activity_name: 'Team Building Workshop',
  description: 'A workshop focused on team collaboration',
  start_date: '2024-02-01T09:00:00Z',
  end_date: '2024-02-01T17:00:00Z',
  location: 'Conference Room A'
});

// Join activity
const participation = await activityService.joinActivity('activity-123');
```

### Badge Management

```typescript
import { badgeService } from '@/services/apis';

// Get badges with filters
const badges = await badgeService.getBadges({
  org_id: 'org-123',
  is_active: true,
  badge_type: 'achievement'
});

// Create new badge
const newBadge = await badgeService.createBadge('org-123', {
  badge_name: 'Excellence Badge',
  description: 'Awarded for exceptional performance',
  image_url: 'https://example.com/badge.png',
  criteria: 'Complete 10 activities with 95% accuracy',
  badge_type: 'achievement',
  rule_config: { required_activities: 10, min_score: 95 },
  is_active: true
});

// Issue badge to user
const issuedBadge = await badgeService.issueBadge('badge-123', 'user-456', {
  performance_score: 98,
  completion_date: new Date().toISOString()
});
```

### Organization Management

```typescript
import { organizationService, organizationAdminService } from '@/services/apis';

// Get organization details
const org = await organizationService.getOrganization('org-123');

// Get organization statistics
const stats = await organizationService.getOrganizationStats('org-123');

// Add admin to organization
const admin = await organizationAdminService.createAdmin('org-123', {
  user_id: 'user-789',
  role: 'admin'
});
```

### User Management

```typescript
import { userService } from '@/services/apis';

// Get user profile
const user = await userService.getUserById('user-123');

// Get user's badges
const userBadges = await userService.getUserBadges('user-123');

// Get user statistics
const userStats = await userService.getUserStats('user-123');

// Get leaderboard
const leaderboard = await userService.getLeaderboard('org-123');
```

## Error Handling

All API services use a consistent error handling pattern:

```typescript
import { ApiError, handleApiError } from '@/services/apis/utils';

try {
  const result = await activityService.getActivity('activity-123');
  // Handle success
} catch (error) {
  const apiError = handleApiError(error);
  
  switch (apiError.status) {
    case 401:
      // Handle unauthorized
      break;
    case 404:
      // Handle not found
      break;
    default:
      // Handle other errors
      console.error('API Error:', apiError.message);
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### API Configuration

The API client can be configured with custom settings:

```typescript
import { ApiClient } from '@/services/apis';

const customApiClient = new ApiClient('https://api.pingbadge.com/v1');
```

## Type Safety

All API responses are fully typed based on the backend Go models:

```typescript
import type { 
  User, 
  Activity, 
  Badge, 
  IssuedBadge,
  PaginatedResponse 
} from '@/services/apis';

// TypeScript will enforce correct types
const handleUserData = (user: User) => {
  console.log(user.username); // ✓ Valid
  console.log(user.invalid_field); // ✗ TypeScript error
};
```

## Pagination

Many endpoints return paginated responses:

```typescript
const activitiesResponse = await activityService.getActivities();

if (activitiesResponse.success) {
  const { data, meta } = activitiesResponse.data;
  
  console.log('Activities:', data);
  console.log('Current Page:', meta.current_page);
  console.log('Total Pages:', meta.total_pages);
  console.log('Total Items:', meta.total);
}
```

## Filtering and Search

Most list endpoints support filtering:

```typescript
// Activity filtering
const activities = await activityService.getActivities({
  org_id: 'org-123',
  status: 'upcoming',
  start_date_from: '2024-01-01T00:00:00Z',
  start_date_to: '2024-12-31T23:59:59Z',
  search: 'workshop'
});

// Badge filtering
const badges = await badgeService.getBadges({
  org_id: 'org-123',
  badge_type: 'achievement',
  is_active: true,
  search: 'excellence'
});

// User filtering
const users = await userService.getUsers({
  role: 'USER',
  privacy_setting: 'public',
  search: 'john'
});
```

## Authentication Flow

The API service handles authentication automatically:

1. **Login**: Store token and user data in localStorage
2. **Auto-attach**: All subsequent requests include the Bearer token
3. **Refresh**: Automatically refresh expired tokens
4. **Logout**: Clear stored authentication data

```typescript
// Check authentication status
if (authService.isAuthenticated()) {
  const currentUser = authService.getCurrentUser();
  console.log('Logged in as:', currentUser?.username);
}
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Type Safety**: Use TypeScript types for all API interactions
3. **Loading States**: Implement loading indicators for async operations
4. **Retry Logic**: Use the built-in retry mechanism for critical operations
5. **Caching**: Consider implementing client-side caching for frequently accessed data

## API Endpoints Reference

All available endpoints are documented in the `API_ENDPOINTS` constant:

```typescript
import { API_ENDPOINTS } from '@/services/apis';

console.log(API_ENDPOINTS.ACTIVITIES.BY_ID('123')); // "/activities/123"
console.log(API_ENDPOINTS.USERS.BADGES('user-456')); // "/users/user-456/badges"
```

## Testing

Example test for API services:

```typescript
import { activityService } from '@/services/apis';
import { vi, describe, it, expect } from 'vitest';

// Mock API client
vi.mock('@/services/apis', () => ({
  activityService: {
    getActivity: vi.fn()
  }
}));

describe('ActivityService', () => {
  it('should fetch activity by ID', async () => {
    const mockActivity = { activity_id: '123', activity_name: 'Test Activity' };
    vi.mocked(activityService.getActivity).mockResolvedValue({
      success: true,
      data: mockActivity,
      message: 'Success'
    });

    const result = await activityService.getActivity('123');
    expect(result.data).toEqual(mockActivity);
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured correctly
2. **Authentication Errors**: Check token expiration and refresh logic
3. **Type Errors**: Ensure frontend types match backend models
4. **Network Errors**: Check network connectivity and API URL

### Debug Mode

Enable debug logging by setting localStorage:

```typescript
localStorage.setItem('API_DEBUG', 'true');
```

This will log all API requests and responses to the console.
