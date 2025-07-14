import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization } from '../types';
import { authService, organizationService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  username: string;
  role: 'USER' | 'ORGANIZER';
  bio?: string;
  org_name?: string;
  org_email?: string;
  org_description?: string;
  website_url?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    // Check if user is already logged in via API service
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        if (currentUser.role === 'ORGANIZER') {
          // Fetch the user's organization
          const fetchUserOrganization = async () => {
            try {
              const response = await organizationService.getOrganizations({
                user_id: currentUser.user_id
              });
              
              if (response.success && response.data.length > 0) {
                // Set the first organization found for this user
                setOrganization(response.data[0]);
              } else {
                setOrganization(null);
              }
            } catch (error) {
              console.error('Error fetching user organization:', error);
              setOrganization(null);
            }
          };
          
          fetchUserOrganization();
        }
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        
        if (response.data.user.role === 'ORGANIZER') {
          // Fetch the user's organization
          try {
            const orgResponse = await organizationService.getOrganizations({
              user_id: response.data.user.user_id
            });
            
            if (orgResponse.success && orgResponse.data.length > 0) {
              setOrganization(orgResponse.data[0]);
            } else {
              setOrganization(null);
            }
          } catch (orgError) {
            console.error('Error fetching organization during login:', orgError);
            setOrganization(null);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      // Use the API service register method
      const userRegistrationData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: userData.role,
        bio: userData.bio || undefined
      };

      const response = await authService.register(userRegistrationData);
      
      if (!response.success) {
        return { success: false, message: response.message || 'Registration failed' };
      }

      // If user is an organizer, create the organization
      if (userData.role === 'ORGANIZER' && userData.org_name) {
        try {
          const organizationData = {
            org_name: userData.org_name,
            org_email: userData.org_email || userData.email,
            user_id_owner: response.data.user.user_id,
            description: userData.org_description || '',
            website_url: userData.website_url || '',
            is_verified: false
          };

          const orgResponse = await organizationService.createOrganization(organizationData);
          
          if (orgResponse.success) {
            setOrganization(orgResponse.data);
          }
        } catch (orgError) {
          console.warn('Organization creation failed:', orgError);
          // Don't fail the entire registration if org creation fails
        }
      }

      // Set the user in context
      setUser(response.data.user);

      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    authService.logout(); // This clears tokens from localStorage
    setUser(null);
    setOrganization(null);
  };

  const value = {
    user,
    organization,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isOrganizer: user?.role === 'ORGANIZER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};