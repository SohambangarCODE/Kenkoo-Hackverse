import React from "react";
import Navbar from "./Components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Records from "./Pages/Records";
import Insights from "./Pages/Insights";
import CarePlan from "./Pages/CarePlan";
import FirstAid from "./Pages/FirstAid";
import ContactPage from "./Pages/ContactPage";
import Profile from "./Pages/Profile";
import HomePage from "./Pages/HomePage";
import FloatingAssistant from "./Components/FloatingAssistant";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import HealthAssistant from "./Pages/HealthAssistant";
import VitalsScan from "./Pages/VitalsScan";
import ProtectedRoute from "./Components/ProtectedRoute";

/* ── Authenticated App Shell ──────────────────────────────────────── */
const AppShell = () => (
  <div className="flex flex-col h-full">
    <Navbar />
    <FloatingAssistant />
    <div className="flex-1 overflow-y-auto relative bg-gray-50/50">
      <Routes>
        {/* Default: redirect /app → /app/personalassistant */}
        <Route index element={<Navigate to="personalassistant" replace />} />
        <Route path="personalassistant" element={<HealthAssistant />} />
        <Route path="vitalscan"          element={<VitalsScan />} />
        <Route path="Records"           element={<Records />} />
        <Route path="Insights"          element={<Insights />} />
        <Route path="careplan"          element={<CarePlan />} />
        <Route path="firstaid"          element={<FirstAid />} />
        <Route path="contact"           element={<ContactPage />} />
        <Route path="profile"           element={<Profile />} />
      </Routes>
    </div>
  </div>
);

/* ── Root ─────────────────────────────────────────────────────────── */
const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Private (requires auth) ── */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />

          {/* Fallback: unknown paths → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
