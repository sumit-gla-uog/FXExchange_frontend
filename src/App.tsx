import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Loginpage/LoginPage";
// import { CustomerLandingPage } from "./pages/LandingPage/customer/CustomerLandingPage"
import { AdminLandingPage } from "./pages/LandingPage/admin/AdminLandingPage"
import { AdminDashboardPage } from "./pages/LandingPage/admin/AdminDashboardPage"
// import {SelectRolePage} from "./pages/SelectRolePage"
import { RequireAuth } from "./auth/RequireAuth"
import {SelectRolePage} from './pages/SelectRolePage/SelectRolePage'
import {CustomerLayout} from "../src/pages/LandingPage/customer/CustomerLayout"
import {DashboardPage} from "../src/pages/LandingPage/customer/Dashboard"
import {PortfolioPage} from "./pages/LandingPage/customer/PortfolioPage"
import {CurrenciesPage} from "./pages/LandingPage/customer/CurrenciesPage"
import {PairsPage} from "./pages/LandingPage/customer/PairsPage"
import {OrdersPage} from "./pages/LandingPage/customer/OrdersPage"
import {HistoryPage} from "./pages/LandingPage/customer/HistoryPage"
import {SettingsPage} from "./pages/LandingPage/customer/SettingsPage"
import { PairDetailPage } from "./pages/LandingPage/customer/PairDetailPage"
import { AdminCurrenciesPage } from "./pages/LandingPage/admin/AdminCurrenciesPage";
import { AdminRatesPage } from "./pages/LandingPage/admin/AdminRatesPage";


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

<Route
  path="/admin"
  element={
    <RequireAuth>
      <AdminLandingPage />
    </RequireAuth>
  }
>
  <Route index element={<AdminDashboardPage />} />
  <Route path="dashboard" element={<AdminDashboardPage />} />
  <Route path="currencies" element={<AdminCurrenciesPage />} />
  <Route path="rates" element={<AdminRatesPage />} />
</Route>
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
   <Route path="pairs/:id" element={<PairDetailPage />} />
  <Route path="orders" element={<OrdersPage />} />
  <Route path="history" element={<HistoryPage />} />
  <Route path="settings" element={<SettingsPage />} /> 
</Route>
    </Routes>
  );
}