import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
        <Shield className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold text-gray-900">PingBadge</span>
    </Link>
  );
};

export default Logo;
