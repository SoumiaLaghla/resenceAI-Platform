import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from './components/Sidebar';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CommunityHome from "./pages/CommunityHome";
import PostDataVisualization from './pages/DataVisualization';
import PostDataTable from './pages/PostDataTable';
import Communities from './pages/Communities';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import ManageCommunityMembers from './pages/manageComm';
import { useTranslation } from 'react-i18next';

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const noSidebar = location.pathname === "/register" || location.pathname === "/login";

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {!noSidebar && <Sidebar />} {/* Affichez le Sidebar sauf pour login/register */}
      <div 
        style={{ 
          flex: 1, 
          padding: noSidebar ? '0' : '20px', 
          marginLeft: noSidebar ? '0' : '20px'  // Décaler le contenu à droite quand la sidebar est visible
        }}>
        <Routes>
          {/* Routes avec Sidebar */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/posts/:postId/data" element={<ProtectedRoute><PostDataTable /></ProtectedRoute>} />
          <Route path="/communities/:community_id/home" element={<ProtectedRoute><CommunityHome /></ProtectedRoute>} />
          <Route path="/communities/:community_id/manage-users" element={<ProtectedRoute><ManageCommunityMembers /></ProtectedRoute>} />
          <Route path="/posts/:postId/dash" element={<ProtectedRoute><PostDataVisualization /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
