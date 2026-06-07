import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Messages from "./pages/Messages";

import ClientDashboard from "./pages/client/ClientDashboard";
import SubmitCase from "./pages/client/SubmitCase";

import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import TimesheetPage from "./pages/lawyer/TimesheetPage";

import PartnerDashboard from "./pages/partner/PartnerDashboard";

import ArbitratorDashboard from "./pages/arbitrator/ArbitratorDashboard";

import FinanceDashboard from "./pages/finance/FinanceDashboard";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  
  return <>{children}</>;
};

const RoleRedirect = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  
  if (currentUser) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />
        
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="submit" element={<SubmitCase />} />
          <Route path="cases" element={<div className="p-6"><h2 className="text-xl font-bold">我的案件</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="bills" element={<div className="p-6"><h2 className="text-xl font-bold">账单中心</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="invoices" element={<div className="p-6"><h2 className="text-xl font-bold">发票管理</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
        </Route>
        
        <Route
          path="/lawyer"
          element={
            <ProtectedRoute allowedRoles={["lawyer"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<LawyerDashboard />} />
          <Route path="cases" element={<div className="p-6"><h2 className="text-xl font-bold">案件管理</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="tasks" element={<div className="p-6"><h2 className="text-xl font-bold">任务管理</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="schedule" element={<div className="p-6"><h2 className="text-xl font-bold">日程排期</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="timesheet" element={<TimesheetPage />} />
        </Route>
        
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={["partner"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PartnerDashboard />} />
          <Route path="cases" element={<div className="p-6"><h2 className="text-xl font-bold">案件总览</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="analytics" element={<div className="p-6"><h2 className="text-xl font-bold">统计分析</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="lawyers" element={<div className="p-6"><h2 className="text-xl font-bold">律师业绩</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
        </Route>
        
        <Route
          path="/arbitrator"
          element={
            <ProtectedRoute allowedRoles={["arbitrator"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ArbitratorDashboard />} />
          <Route path="cases" element={<div className="p-6"><h2 className="text-xl font-bold">待审案件</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="awards" element={<div className="p-6"><h2 className="text-xl font-bold">裁决书管理</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
        </Route>
        
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={["finance"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FinanceDashboard />} />
          <Route path="reports" element={<div className="p-6"><h2 className="text-xl font-bold">月度报表</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
          <Route path="invoices" element={<div className="p-6"><h2 className="text-xl font-bold">发票管理</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
        </Route>
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Messages />} />
        </Route>
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6"><h2 className="text-xl font-bold">系统设置</h2><p className="text-gray-500 mt-2">页面开发中...</p></div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
