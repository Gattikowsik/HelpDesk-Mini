import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import TicketsListPage from './pages/TicketsListPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterPage from './pages/RegisterPage'; 

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> 
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <TicketsListPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<ProtectedRoute><TicketsListPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}