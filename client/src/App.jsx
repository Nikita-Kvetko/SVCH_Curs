import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { store } from './store/store';
import Navbar from './components/Navbar';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Chat from './pages/Chat';
import FertilizerShop from './pages/FertilizerShop';
import BookingsCalendar from './pages/BookingsCalendar';
import AdminPanel from './pages/AdminPanel';
import LandingPage from './pages/LandingPage';

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#ff8f00' },
  },
});

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Главная страница — лендинг для неавторизованных, фермы для авторизованных */}
            <Route 
              path="/" 
              element={
                localStorage.getItem('token') ? <Farms /> : <LandingPage />
              } 
            />
            
            {/* Защищённые маршруты */}
            <Route
              path="/farms"
              element={
                <ProtectedRoute>
                  <Farms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farm/:id"
              element={
                <ProtectedRoute>
                  <FarmDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <FertilizerShop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;