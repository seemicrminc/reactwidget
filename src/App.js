import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WidgetPreview from './pages/WidgetPreview';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Widget Preview Routes (for testing and embedding) */}
        <Route path="/widget/preview" element={<WidgetPreview />} />
        <Route path="/widget/preview/:widgetId" element={<WidgetPreview />} />
        <Route path="/widget/:widgetId" element={<WidgetPreview />} />
        
        {/* Direct widget type routes for easy testing */}
        <Route path="/widget/signup" element={<WidgetPreview />} />
        <Route path="/widget/login-widget" element={<WidgetPreview />} />
        <Route path="/widget/contact" element={<WidgetPreview />} />
        <Route path="/widget/booking" element={<WidgetPreview />} />
        <Route path="/widget/calendar" element={<WidgetPreview />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
