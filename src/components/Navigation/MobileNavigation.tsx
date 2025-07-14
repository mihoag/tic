import React from 'react';
import { Link } from 'react-router-dom';

interface MobileNavigationProps {
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  children?: React.ReactNode; // For gamification stats
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isAuthenticated,
  isOrganizer,
  isOpen,
  onClose,
  onLogout,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
        {isAuthenticated ? (
          <>
            {children}
            
            {!isOrganizer && (
              <Link
                to="/feed"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={onClose}
              >
                Feed
              </Link>
            )}
            
            {isOrganizer ? (
              <Link
                to="/org-dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={onClose}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={onClose}
              >
                Dashboard
              </Link>
            )}
            
            {isOrganizer && (
              <>
                <Link
                  to="/org-profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  onClick={onClose}
                >
                  Organization
                </Link>
                <Link
                  to="/manage-badges"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  onClick={onClose}
                >
                  Badges
                </Link>
              </>
            )}
            
            {!isOrganizer && (
              <Link
                to="/badges"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                onClick={onClose}
              >
                My Badges
              </Link>
            )}
            
            <Link
              to="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
              onClick={onClose}
            >
              Profile
            </Link>
            
            <button
              onClick={onLogout}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/feed"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
              onClick={onClose}
            >
              Explore
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
              onClick={onClose}
            >
              About
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block px-3 py-2 text-base font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={onClose}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavigation;
