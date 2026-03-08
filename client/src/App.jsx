import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import Notices from './pages/Notices';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import LostFound from './pages/LostFound';
import Users from './pages/Users';

export default function App() {
  return (
    <div className="min-h-screen gradient-bg">

      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />

            {/* 🔥 Chat Routes */}
            <Route path="/chat/:room" element={<Chat />} />
            
            

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </main>

    </div>
  );
}
