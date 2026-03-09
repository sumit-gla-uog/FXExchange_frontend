import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Loginpage/LoginPage";
import { CustomerLandingPage } from "./pages/LandingPage/customer/CustomerLandingPage";
import { AdminLandingPage } from "./pages/LandingPage/AdminLandingPage";
// import {SelectRolePage} from "./pages/SelectRolePage"
import { RequireAuth } from "./auth/RequireAuth";
import {SelectRolePage} from './pages/SelectRolePage/SelectRolePage';
import {CustomerLayout} from "../src/pages/LandingPage/customer/CustomerLayout";
import {DashboardPage} from "../src/pages/LandingPage/customer/Dashboard";
import {PortfolioPage} from "./pages/landingpage/customer/PortfolioPage";
import {CurrenciesPage} from "./pages/landingpage/customer/CurrenciesPage";
import {PairsPage} from "./pages/landingpage/customer/PairsPage";
import {OrdersPage} from "./pages/landingpage/customer/OrdersPage";
import {HistoryPage} from "./pages/landingpage/customer/HistoryPage";
import {SettingsPage} from "./pages/landingpage/customer/SettingsPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-role" element={
        <RequireAuth>
        <SelectRolePage />
      </RequireAuth>
        
        } />
      {/* <Route path="/customer" element={
        <RequireAuth>
          <CustomerLandingPage />
        </RequireAuth>
      } /> */}

<Route
    path="/admin"
    element={
      <RequireAuth>
        <AdminLandingPage />
      </RequireAuth>
    }
  />
  <Route
  path="/customer"
  element={
    <RequireAuth>
      <CustomerLayout />
    </RequireAuth>
  }
>
  <Route index element={<DashboardPage />} />
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="portfolio" element={<PortfolioPage />} />
  <Route path="currencies" element={<CurrenciesPage />} />
   <Route path="pairs" element={<PairsPage />} />
  <Route path="orders" element={<OrdersPage />} />
  <Route path="history" element={<HistoryPage />} />
  <Route path="settings" element={<SettingsPage />} /> 
</Route>
    </Routes>
  );
}