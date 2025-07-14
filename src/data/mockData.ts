import { User, Organization, Badge, IssuedBadge, Activity, ActivityParticipation } from '../types';

export const mockUsers: User[] = [
  {
    user_id: 'user-1',
    username: 'ecowarrior2024',
    email: 'jane.smith@email.com',
    full_name: 'Jane Smith',
    profile_picture_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150',
    bio: 'Passionate about environmental sustainability and community action.',
    role: 'USER',
    privacy_setting: 'public',
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    user_id: 'user-2',
    username: 'greenenthusiast',
    email: 'mike.johnson@email.com',
    full_name: 'Mike Johnson',
    profile_picture_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150',
    bio: 'Student leader in environmental initiatives.',
    role: 'USER',
    privacy_setting: 'public',
    created_at: '2024-02-01T10:30:00Z'
  },
  {
    user_id: 'org-owner-1',
    username: 'greentech_admin',
    email: 'admin@greentech.org',
    full_name: 'Sarah Green',
    role: 'ORGANIZER',
    privacy_setting: 'public',
    created_at: '2024-01-01T08:00:00Z'
  }
];

export const mockOrganizations: Organization[] = [
  {
    org_id: 'org-1',
    org_name: 'GreenTech University',
    org_email: 'contact@greentech.edu',
    org_logo_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=150',
    user_id_owner: 'org-owner-1',
    description: 'Leading the way in sustainable technology education and environmental research.',
    website_url: 'https://greentech.edu',
    is_verified: true,
    created_at: '2024-01-01T08:00:00Z'
  },
  {
    org_id: 'org-2',
    org_name: 'EcoAction Foundation',
    org_email: 'info@ecoaction.org',
    org_logo_url: 'https://images.pexels.com/photos/305827/pexels-photo-305827.jpeg?w=150',
    user_id_owner: 'org-owner-1',
    description: 'Non-profit organization dedicated to environmental conservation and community engagement.',
    website_url: 'https://ecoaction.org',
    is_verified: true,
    created_at: '2024-01-05T09:00:00Z'
  }
];

export const mockBadges: Badge[] = [
  {
    badge_def_id: 'badge-1',
    org_id: 'org-1',
    badge_name: 'Campus Clean Hero',
    description: 'Awarded for participating in campus cleanup activities',
    image_url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=200',
    criteria: 'Participate in at least 1 campus cleanup event',
    is_active: true,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    badge_def_id: 'badge-2',
    org_id: 'org-1',
    badge_name: 'Sustainability Champion',
    description: 'Earned by completing 5 environmental activities',
    image_url: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?w=200',
    criteria: 'Complete 5 different environmental activities',
    is_active: true,
    created_at: '2024-01-12T11:00:00Z'
  },
  {
    badge_def_id: 'badge-3',
    org_id: 'org-2',
    badge_name: 'Tree Planter',
    description: 'For those who help plant trees in community spaces',
    image_url: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?w=200',
    criteria: 'Plant at least 10 trees in community events',
    is_active: true,
    created_at: '2024-01-15T12:00:00Z'
  }
];

export const mockActivities: Activity[] = [
  {
    activity_id: 'activity-1',
    org_id: 'org-1',
    activity_name: 'Campus Earth Day Cleanup',
    description: 'Join us for a comprehensive cleanup of the university campus. Bring gloves and we\'ll provide all other equipment.',
    start_date: '2024-04-22T09:00:00Z',
    end_date: '2024-04-22T15:00:00Z',
    location: 'GreenTech University Main Campus',
    badge_def_id: 'badge-1',
    created_at: '2024-03-15T10:00:00Z',
    organization: mockOrganizations[0],
    badge: mockBadges[0]
  },
  {
    activity_id: 'activity-2',
    org_id: 'org-2',
    activity_name: 'Community Tree Planting',
    description: 'Help us plant 100 native trees in Central Park. This event is part of our city-wide reforestation initiative.',
    start_date: '2024-05-15T08:00:00Z',
    end_date: '2024-05-15T16:00:00Z',
    location: 'Central Park, Section A',
    badge_def_id: 'badge-3',
    created_at: '2024-04-01T09:00:00Z',
    organization: mockOrganizations[1],
    badge: mockBadges[2]
  },
  {
    activity_id: 'activity-3',
    org_id: 'org-1',
    activity_name: 'Sustainable Technology Workshop',
    description: 'Learn about renewable energy solutions and sustainable tech innovations. Open to all skill levels.',
    start_date: '2024-05-20T14:00:00Z',
    end_date: '2024-05-20T17:00:00Z',
    location: 'Tech Building, Room 101',
    created_at: '2024-04-10T11:00:00Z',
    organization: mockOrganizations[0]
  }
];

export const mockIssuedBadges: IssuedBadge[] = [
  {
    issued_badge_id: 'issued-1',
    badge_def_id: 'badge-1',
    user_id: '3914e1ff-39d5-4cb6-a88f-4d4956f2ec8b',
    org_id: 'org-1',
    issue_date: '2024-04-22T16:00:00Z',
    verification_code: 'PB-2024-001-ABC123',
    status: 'issued',
    badge: mockBadges[0],
    organization: mockOrganizations[0]
  },
  {
    issued_badge_id: 'issued-2',
    badge_def_id: 'badge-3',
    user_id: '3914e1ff-39d5-4cb6-a88f-4d4956f2ec8b',
    org_id: 'org-2',
    issue_date: '2024-05-15T17:00:00Z',
    verification_code: 'PB-2024-002-XYZ789',
    status: 'issued',
    badge: mockBadges[2],
    organization: mockOrganizations[1]
  }
];

export const mockActivityParticipations: ActivityParticipation[] = [
  {
    participation_id: 'part-1',
    activity_id: 'activity-1',
    user_id: 'user-1',
    status: 'completed',
    issued_badge_id: 'issued-1',
    created_at: '2024-04-22T09:30:00Z'
  },
  {
    participation_id: 'part-2',
    activity_id: 'activity-2',
    user_id: 'user-1',
    status: 'completed',
    issued_badge_id: 'issued-2',
    created_at: '2024-05-15T08:30:00Z'
  },
  {
    participation_id: 'part-3',
    activity_id: 'activity-3',
    user_id: 'user-1',
    status: 'registered',
    created_at: '2024-05-01T10:00:00Z'
  }
];