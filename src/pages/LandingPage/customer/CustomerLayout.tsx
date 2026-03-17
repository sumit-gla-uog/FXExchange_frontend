import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { FlexLayout, Text, Button } from "@salt-ds/core"
import { CustomerSidebar } from "./CustomerSidebar"
import { logout } from "../../../api/auth"
import { useIsMobile } from "../../../hooks/UseIsMobile"

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/customer/dashboard": { title: "Dashboard", subtitle: "Overview of your account" },
  "/customer/portfolio": { title: "Portfolio", subtitle: "Your currency holdings" },
  "/customer/currencies": { title: "Currencies", subtitle: "Browse and explore available currencies" },
  "/customer/pairs": { title: "Trading Pairs", subtitle: "Execute trades on available currency pairs" },
  "/customer/orders": { title: "Orders", subtitle: "Manage your open and past orders" },
  "/customer/history": { title: "History", subtitle: "Full trade and order history" },
  "/customer/settings": { title: "Settings", subtitle: "Account preferences" },
};

const DEFAULT_META = { title: "Customer", subtitle: "Dashboard Area" }

export const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  // const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // useEffect(() => {
  //   const handler = () => setIsMobile(window.innerWidth < 768)
  //   window.addEventListener("resize", handler)
  //   return () => window.removeEventListener("resize", handler)
  // }, [])

  const handleLogout = () => { logout(); navigate("/login", { replace: true }) }

  // Exact match first, then prefix match (covers /customer/pairs/:id etc.)
  const meta =
    PAGE_META[location.pathname] ??
    Object.entries(PAGE_META).find(([key]) => location.pathname.startsWith(key))?.[1] ??
    DEFAULT_META;

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f6f7f9" }}>

      {/* {!isMobile && (
        <CustomerSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      )} */}
      <CustomerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        isMobile={isMobile}
      />

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{
          background: "#0f766e",
          padding: isMobile ? "12px 16px" : "18px 24px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <FlexLayout justify="space-between" align="center">
            <div>
              <Text style={{ color: "white", fontSize: isMobile ? 18 : 22, fontWeight: 800, lineHeight: 1.2 }}>
                {meta.title}
              </Text>
              {/* {!isMobile && (
                <Text style={{ color: "#d1fae5", fontSize: 13, marginTop: 2 }}>
                  {meta.subtitle}
                </Text>
              )} */}
            </div>
            <Button appearance="secondary" style={{ color: "white", fontSize: isMobile ? 13 : 14 }} onClick={handleLogout}>
              Logout
            </Button>
          </FlexLayout>
        </div>

        <div style={{ padding: isMobile ? "16px 12px" : "24px", paddingBottom: isMobile ? 80 : 24, flex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* {isMobile && (
        <CustomerSidebar collapsed={false} onToggle={() => setCollapsed((v) => !v)} />
      )} */}
    </div>
  )
}