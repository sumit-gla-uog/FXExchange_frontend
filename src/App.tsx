import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { RequireAuth } from "./auth/RequireAuth"

// Eagerly loaded small, always needed on first visit
import { LoginPage } from "./pages/Loginpage/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { SelectRolePage } from "./pages/SelectRolePage/SelectRolePage"

// Lazily loaded deferred until navigated to
const AdminLandingPage = lazy(() => import("./pages/admin/AdminLandingPage").then(m => ({ default: m.AdminLandingPage })))
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })))
const AdminCurrenciesPage = lazy(() => import("./pages/admin/AdminCurrenciesPage").then(m => ({ default: m.AdminCurrenciesPage })))
const AdminRatesPage = lazy(() => import("./pages/admin/AdminRatesPage").then(m => ({ default: m.AdminRatesPage })))

const CustomerLayout = lazy(() => import("./pages/customer/CustomerLayout").then(m => ({ default: m.CustomerLayout })))
const DashboardPage = lazy(() => import("./pages/customer/DashBoard").then(m => ({ default: m.DashboardPage })))
const PortfolioPage = lazy(() => import("./pages/customer/PortfolioPage").then(m => ({ default: m.PortfolioPage })))
const CurrenciesPage = lazy(() => import("./pages/customer/CurrenciesPage").then(m => ({ default: m.CurrenciesPage })))
const PairsPage = lazy(() => import("./pages/customer/PairsPage").then(m => ({ default: m.PairsPage })))
const PairDetailPage = lazy(() => import("./pages/customer/PairDetailPage").then(m => ({ default: m.PairDetailPage })))
const OrdersPage = lazy(() => import("./pages/customer/OrdersPage").then(m => ({ default: m.OrdersPage })))
const HistoryPage = lazy(() => import("./pages/customer/HistoryPage").then(m => ({ default: m.HistoryPage })))
const DepositPage = lazy(() => import("./pages/customer/DepositPage").then(m => ({ default: m.DepositPage })))
const SettingsPage = lazy(() => import("./pages/customer/SettingsPage").then(m => ({ default: m.SettingsPage })))

const Loader = () => (
<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
<div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#0f766e", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
<style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
</div>
)

export default function App() {
return (
<Suspense fallback={<Loader />}>
<Routes>
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />

<Route path="/select-role" element={
<RequireAuth><SelectRolePage /></RequireAuth>
} />

<Route path="/admin" element={
<RequireAuth><AdminLandingPage /></RequireAuth>
}>
<Route index element={<AdminDashboardPage />} />
<Route path="dashboard" element={<AdminDashboardPage />} />
<Route path="currencies" element={<AdminCurrenciesPage />} />
<Route path="rates" element={<AdminRatesPage />} />
</Route>

<Route path="/customer" element={
<RequireAuth><CustomerLayout /></RequireAuth>
}>
<Route index element={<DashboardPage />} />
<Route path="dashboard" element={<DashboardPage />} />
<Route path="portfolio" element={<PortfolioPage />} />
<Route path="currencies" element={<CurrenciesPage />} />
<Route path="pairs" element={<PairsPage />} />
<Route path="pairs/:id" element={<PairDetailPage />} />
<Route path="orders" element={<OrdersPage />} />
<Route path="history" element={<HistoryPage />} />
<Route path="deposit" element={<DepositPage />} />
<Route path="settings" element={<SettingsPage />} />
</Route>
</Routes>
</Suspense>
)
}