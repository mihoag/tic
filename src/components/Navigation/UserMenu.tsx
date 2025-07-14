import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { User as UserType } from '../../types';

interface UserMenuProps {
  user: UserType | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  children?: React.ReactNode; // For gamification stats
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isAuthenticated,
  onLogout,
  children
}) => {
  if (!isAuthenticated) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-gray-700 hover:text-green-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <div className="flex items-center space-x-4">
        {children}
        
        <Link
          to="/profile"
          className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
        >
          {user?.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {user?.full_name || user?.username}
          </span>
        </Link>
        
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
