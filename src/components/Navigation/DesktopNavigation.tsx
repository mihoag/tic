import React from 'react';
import { Link } from 'react-router-dom';

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  isAuthenticated,
  isOrganizer
}) => {
  if (!isAuthenticated) {
    return <nav className="hidden md:flex items-center space-x-8" />;
  }

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {!isOrganizer && (
        <Link
          to="/feed"
          className="text-gray-700 hover:text-green-600 transition-colors"
        >
          Feed
        </Link>
      )}
      
      {isOrganizer ? (
        <Link
          to="/org-dashboard"
          className="text-gray-700 hover:text-green-600 transition-colors"
        >
          Dashboard
        </Link>
      ) : (
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-green-600 transition-colors"
        >
          Dashboard
        </Link>
      )}
      
      {isOrganizer && (
        <>
          <Link
            to="/org-profile"
            className="text-gray-700 hover:text-green-600 transition-colors"
          >
            Organization
          </Link>
          <Link
            to="/manage-badges"
            className="text-gray-700 hover:text-green-600 transition-colors"
          >
            Badges
          </Link>
        </>
      )}
      
      {!isOrganizer && (
        <Link
          to="/badges"
          className="text-gray-700 hover:text-green-600 transition-colors"
        >
          My Badges
        </Link>
      )}
    </nav>
  );
};

export default DesktopNavigation;
