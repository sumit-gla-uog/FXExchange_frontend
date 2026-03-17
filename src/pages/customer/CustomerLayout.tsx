import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { FlexLayout, Text, Button } from "@salt-ds/core"
import { CustomerSidebar } from "./CustomerSidebar"
import { logout } from "../../api/auth"
import { useIsMobile } from "../../hooks/UseIsMobile"
import "./CustomerLayout.css"

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/customer/dashboard": { title: "Dashboard", subtitle: "Overview of your account" },
  "/customer/portfolio": { title: "Portfolio", subtitle: "Your currency holdings" },
  "/customer/currencies": { title: "Currencies", subtitle: "Browse and explore available currencies" },
  "/customer/pairs": { title: "Trading Pairs", subtitle: "Execute trades on available currency pairs" },
  "/customer/orders": { title: "Orders", subtitle: "Manage your open and past orders" },
  "/customer/history": { title: "History", subtitle: "Full trade and order history" },
  "/customer/settings": { title: "Settings", subtitle: "Account preferences" },
}

const DEFAULT_META = { title: "Customer", subtitle: "Dashboard Area" }

export const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate("/login", { replace: true }) }

  const meta =
    PAGE_META[location.pathname] ??
    Object.entries(PAGE_META).find(([key]) => location.pathname.startsWith(key))?.[1] ??
    DEFAULT_META

  return (
    <div className="customer-layout">
      <CustomerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        isMobile={isMobile}
      />

      <main>
        <div className={`customer-topbar ${isMobile ? "mobile" : ""}`}>
          <FlexLayout justify="space-between" align="center">
            <Text className="title">{meta.title}</Text>
            <Button appearance="secondary" className="logout" onClick={handleLogout}>
              Logout
            </Button>
          </FlexLayout>
        </div>

        <div className={`customer-page-content ${isMobile ? "mobile" : ""}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}