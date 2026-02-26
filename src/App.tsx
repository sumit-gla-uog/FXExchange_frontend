import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { RequireAuth } from "./auth/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={
        <RequireAuth>
          <LandingPage />
        </RequireAuth>
      } />
    </Routes>
  );
}