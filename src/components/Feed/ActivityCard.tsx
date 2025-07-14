import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Award,
  Users,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Activity } from "../../types";

interface ActivityCardProps {
  activity: Activity;
  participation?: Activity;
  isAuthenticated: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  participation,
  isAuthenticated,
}) => {
  const [isJoining, setIsJoining] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleJoinActivity = async () => {
    if (!isAuthenticated) return;

    setIsJoining(true);
    // Simulate API call
    setTimeout(() => {
      setIsJoining(false);
      // In a real app, this would update the data
      alert("Successfully joined the activity!");
    }, 1000);
  };

  const getStatusBadge = () => {
    if (!participation) return null;

    const statusConfig = {
      registered: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        text: "Registered",
      },
      attended: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Users,
        text: "Attended",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Completed",
      },
    };

    const config = statusConfig[participation.status];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="h-4 w-4" />
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {activity.activity_name}
              </h3>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">
          {activity.description}
        </p>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm">{formatDate(activity.start_date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm">{activity.location}</p>
            </div>
          </div>
        </div>

        {/* Badge Info */}
        {activity.badge && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {activity.badge.badge_name}
                </h4>
                <p className="text-sm text-gray-600">
                  {activity.badge.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/activity/${activity.activity_id}`}
            className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Details</span>
          </Link>

          {!isAuthenticated && (
            <button
              onClick={() => alert("Please login to join activities")}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Login to Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
