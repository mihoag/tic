import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import HomePage from "./components/Home/HomePage";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";
import ActivityFeed from "./components/Feed/ActivityFeed";
import UserDashboard from "./components/Dashboard/UserDashboard";
import OrgDashboard from "./components/Dashboard/OrgDashboard";
import BadgeCollection from "./components/Badges/BadgeCollection";
import ProfilePage from "./components/Profile/ProfilePage";
import ActivityDetailPage from "./components/Activity/ActivityDetailPage";
import CreateActivityPage from "./components/Activity/CreateActivityPage";
import ManageActivitiesPage from "./components/Activity/ManageActivitiesPage";
import OrgProfilePage from "./components/Profile/OrgProfilePage";
import BadgePage from "./components/Badge/BadgePage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>
};

const OrgRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizer } = useAuth();

  return isAuthenticated && isOrganizer ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" />
  );
};

function AppRoutes() {
  const { isOrganizer } = useAuth();
  console.log("isOrganizer:", isOrganizer);
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feed" element={<ActivityFeed />} />
        <Route path="/activity/:activityId" element={<ActivityDetailPage />} />
        

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {isOrganizer ? (
                <Navigate to="/org-dashboard" />
              ) : (
                <UserDashboard />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/org-dashboard"
          element={
            <OrgRoute>
              <OrgDashboard />
            </OrgRoute>
          }
        />

        <Route
          path="/create-activity"
          element={
            <OrgRoute>
              <CreateActivityPage />
            </OrgRoute>
          }
        />

        <Route
          path="/manage-activities"
          element={
            <OrgRoute>
              <ManageActivitiesPage />
            </OrgRoute>
          }
        />

        <Route
          path="/org-profile"
          element={
            <OrgRoute>
              <OrgProfilePage />
            </OrgRoute>
          }
        />

        <Route
          path="/manage-badges"
          element={
            <OrgRoute>
              <BadgePage />
            </OrgRoute>
          }
        />

        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <BadgeCollection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
