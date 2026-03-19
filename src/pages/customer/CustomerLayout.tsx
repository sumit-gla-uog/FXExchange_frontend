import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import useSWR from "swr"
import { FlexLayout, Text, Button } from "@salt-ds/core"
import { CustomerSidebar } from "./CustomerSidebar"
import { logout } from "../../api/auth"
import { fetcher } from "../../api/swr"
import { useIsMobile } from "../../hooks/UseIsMobile"
import "./CustomerLayout.css"

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/customer/dashboard":  { title: "Dashboard",    subtitle: "Overview of your account" },
  "/customer/portfolio":  { title: "Portfolio",     subtitle: "Your currency holdings" },
  "/customer/currencies": { title: "Currencies",    subtitle: "Browse and explore available currencies" },
  "/customer/pairs":      { title: "Trading Pairs", subtitle: "Execute trades on available currency pairs" },
  "/customer/orders":     { title: "Orders",        subtitle: "Manage your open and past orders" },
  "/customer/history":    { title: "History",       subtitle: "Full trade and order history" },
  "/customer/settings":   { title: "Settings",      subtitle: "Account preferences" },
  "/customer/deposit":    { title: "Deposit",       subtitle: "Add funds to your account" },
  "/customer/profile":    { title: "Profile",       subtitle: "Your account details" },
}

const DEFAULT_META = { title: "Customer", subtitle: "Dashboard Area" }

export const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  const { data } = useSWR<{ user: { username: string; role: string } }>(
    "/api/v1/auth/me/", fetcher
  )

  const username = data?.user?.username ?? "Guest"
  const initial  = username.charAt(0).toUpperCase()

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
          <FlexLayout justify="space-between" align="center" gap={2}>
            <Text className="title">{meta.title}</Text>

            <FlexLayout align="center" gap={2}>
              {/* Add Money button */}
              {/* <Button
                appearance="solid"
                sentiment="accented"
                className="topbar-add-money-btn"
                onClick={() => navigate("/customer/deposit")}
              >
                + Add Money
              </Button> */}

              {/* User avatar + username */}
              <FlexLayout
                align="center"
                gap={1}
                className="topbar-user"
                // onClick={() => navigate("/customer/profile")}
              >
                {/* <div className="topbar-avatar">{initial}</div> */}
                {!isMobile && (
                  <Text className="topbar-username" style={{color:"white"}}>
                    Welcome, <span className="topbar-username-highlight">{username}</span>
                  </Text>
                )}
              </FlexLayout>

              {/* Logout */}
              <Button appearance="primary" className="logout" onClick={handleLogout}>
                Logout
              </Button>
            </FlexLayout>
          </FlexLayout>
        </div>

        <div className={`customer-page-content ${isMobile ? "mobile" : ""}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}