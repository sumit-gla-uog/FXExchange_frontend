import { useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { StackLayout, FlexLayout, Text, Button } from "@salt-ds/core"
import { BuildReportIcon, CurrencyExchangeIcon, HistoryIcon, HomeIcon, NoteIcon, SettingsIcon, SwapIcon } from "@salt-ds/icons"
import "./CustomerSidebar.css"

type Item = { label: string; to: string; icon: React.ReactNode; disabled?: boolean }

export const CustomerSidebar = ({
  collapsed,
  onToggle,
  isMobile,
}: {
  collapsed: boolean
  onToggle: () => void
  isMobile: boolean
}) => {
  const location = useLocation()

  const items: Item[] = useMemo(() => [
    { label: "Dashboard",  to: "/customer/dashboard",  icon: <HomeIcon /> },
    { label: "Portfolio",  to: "/customer/portfolio",  icon: <BuildReportIcon /> },
    { label: "Currencies", to: "/customer/currencies", icon: <CurrencyExchangeIcon /> },
    { label: "Pairs",      to: "/customer/pairs",      icon: <SwapIcon /> },
    { label: "Orders",     to: "/customer/orders",     icon: <NoteIcon /> },
    { label: "History",    to: "/customer/history",    icon: <HistoryIcon /> },
    { label: "Settings",   to: "/customer/settings",   icon: <SettingsIcon />, disabled: true },
  ], [])

  if (isMobile) {
    const visibleItems = items.filter((i) => !i.disabled)
    return (
      <nav className="sidebar-mobile-nav">
        {visibleItems.map((it) => {
          const isActive = location.pathname.startsWith(it.to)
          return (
            <NavLink key={it.to} to={it.to} className={`tab-item ${isActive ? "active" : ""}`}>
              <span className="tab-icon">{it.icon}</span>
              <span className="tab-label">{it.label}</span>
            </NavLink>
          )
        })}
      </nav>
    )
  }

  const width = collapsed ? 72 : 240

  return (
    <aside className="sidebar-desktop" style={{ width, minWidth: width }}>
      <FlexLayout
        align="center"
        justify={collapsed ? "center" : "space-between"}
        className="header"
        style={{ padding: collapsed ? "16px 0" : "16px 14px" }}
      >
        {!collapsed && (
          <FlexLayout align="center" gap={1}>
            <div className="logo">FX</div>
            <Text className="brand">FX Exchange</Text>
          </FlexLayout>
        )}
        <Button appearance="transparent" onClick={onToggle} className="toggle-btn">
          {collapsed ? "☰" : "✕"}
        </Button>
      </FlexLayout>

      <nav>
        <StackLayout gap={0.5}>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              style={({ isActive }) => ({
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "12px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                background: isActive ? "#ecfeff" : "transparent",
                color: it.disabled ? "#d1d5db" : isActive ? "#0f766e" : "#374151",
                pointerEvents: it.disabled ? "none" : "auto",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                transition: "background 0.12s",
                border: "1px solid",
                borderColor: isActive ? "#99f6e4" : "transparent",
              })}
              title={collapsed ? it.label : undefined}
            >
              <span className="nav-icon">{it.icon}</span>
              {!collapsed && <span>{it.label}</span>}
            </NavLink>
          ))}
        </StackLayout>
      </nav>
    </aside>
  )
}