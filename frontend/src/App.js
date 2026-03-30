import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import QrMenu from './pages/QrMenu';
import QrManage from './pages/QrManage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const DashboardRoute = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/qr-menu" element={<QrMenu />} />
            <Route path="/qr-menu/:tableId" element={<QrMenu />} />
            <Route path="/qr-menu/:adminId/:tableId" element={<QrMenu />} />
            <Route path="/super-admin" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<DashboardRoute><Dashboard /></DashboardRoute>} />
            <Route path="/menu" element={<DashboardRoute roles={['Admin', 'Manager']}><MenuManagement /></DashboardRoute>} />
            <Route path="/orders" element={<DashboardRoute roles={['Admin', 'Manager', 'Cashier']}><Orders /></DashboardRoute>} />
            <Route path="/kitchen" element={<DashboardRoute roles={['Admin', 'Manager', 'Kitchen Staff']}><Kitchen /></DashboardRoute>} />
            <Route path="/inventory" element={<DashboardRoute roles={['Admin', 'Manager']}><Inventory /></DashboardRoute>} />
            <Route path="/customers" element={<DashboardRoute roles={['Admin', 'Manager', 'Cashier']}><Customers /></DashboardRoute>} />
            <Route path="/reports" element={<DashboardRoute roles={['Admin', 'Manager']}><Reports /></DashboardRoute>} />
            <Route path="/qr-manage" element={<DashboardRoute roles={['Admin', 'Manager']}><QrManage /></DashboardRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

