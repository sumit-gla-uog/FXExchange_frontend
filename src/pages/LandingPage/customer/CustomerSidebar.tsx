import { useMemo } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { StackLayout, FlexLayout, Text, Button } from "@salt-ds/core"
import { BuildReportIcon, CurrencyExchangeIcon, HistoryIcon, HomeIcon, NoteIcon, SettingsIcon, SwapIcon } from "@salt-ds/icons";

type Item = { label: string; to: string; icon: string; disabled?: boolean }

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

  const items: Item[] = useMemo(
    () => [
      { label: "Dashboard", to: "/customer/dashboard", icon: <HomeIcon /> },
      { label: "Portfolio", to: "/customer/portfolio", icon: <BuildReportIcon /> },
      { label: "Currencies", to: "/customer/currencies", icon: <CurrencyExchangeIcon /> },
      { label: "Pairs", to: "/customer/pairs", icon: <SwapIcon /> },
      { label: "Orders", to: "/customer/orders", icon: <NoteIcon /> },
      { label: "History", to: "/customer/history", icon: <HistoryIcon /> },
      { label: "Settings", to: "/customer/settings", icon: <SettingsIcon />, disabled: true },
    ],
    []
  )

  // Mobile: fixed bottom tab bar
  if (isMobile) {
    const visibleItems = items.filter((i) => !i.disabled)
    return (
      <nav
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 200,
          background: "white",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          height: 64,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {visibleItems.map((it) => {
          const isActive = location.pathname.startsWith(it.to)
          return (
            <NavLink
              key={it.to}
              to={it.to}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                gap: 2,
                background: isActive ? "#f0fdf4" : "transparent",
                borderTop: isActive ? "2px solid #0f766e" : "2px solid transparent",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{it.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#0f766e" : "#6b7280",
                letterSpacing: 0.2,
              }}>
                {it.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    )
  }

  // Desktop: collapsible sidebar
  const width = collapsed ? 72 : 240

  return (
    <aside
      style={{
        width,
        minWidth: width,
        transition: "width 180ms ease",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FlexLayout
        align="center"
        justify={collapsed ? "center" : "space-between"}
        style={{ padding: collapsed ? "16px 0" : "16px 14px", borderBottom: "1px solid #f3f4f6" }}
      >
        {!collapsed && (
          <FlexLayout align="center" gap={1}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#0f766e", display: "grid", placeItems: "center",
              color: "white", fontWeight: 800, fontSize: 14, flexShrink: 0,
            }}>
              FX
            </div>
            <Text style={{ fontWeight: 700, fontSize: 15 }}>FX Exchange</Text>
          </FlexLayout>
        )}
        <Button
          appearance="transparent"
          onClick={onToggle}
          style={{ minWidth: 36, padding: "6px 8px", fontSize: 18 }}
        >
          {collapsed ? "☰" : "✕"}
        </Button>
      </FlexLayout>

      <nav style={{ padding: "12px 8px", flex: 1 }}>
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
              <span style={{ fontSize: 18, flexShrink: 0 }}>{it.icon}</span>
              {!collapsed && <span>{it.label}</span>}
            </NavLink>
          ))}
        </StackLayout>
      </nav>
    </aside>
  )
}