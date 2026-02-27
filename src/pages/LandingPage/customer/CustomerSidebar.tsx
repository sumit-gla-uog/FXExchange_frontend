import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { StackLayout, FlexLayout, Text, Button } from "@salt-ds/core";

type Item = { label: string; to: string; disabled?: boolean };

export const CustomerSidebar = ({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) => {
  const items: Item[] = useMemo(
    () => [
      { label: "Dashboard", to: "/customer/dashboard" },
      { label: "Portfolio", to: "/customer/portfolio" },
      { label: "Currencies", to: "/customer/currencies" },
      { label: "Pairs", to: "/customer/pairs" },
      { label: "Orders", to: "/customer/orders" },
      { label: "History", to: "/customer/history" },
      { label: "Settings", to: "/customer/settings", disabled: true },
    ],
    []
  );

  const width = collapsed ? 88 : 260;

  return (
    <aside
      style={{
        width,
        transition: "width 180ms ease",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}
    >
      <FlexLayout align="center" justify="space-between" style={{ padding: 16 }}>
        <FlexLayout align="center" gap={1}>
        <Button appearance="transparent" onClick={onToggle}>
          {collapsed ? "☰" : "x"}
        </Button>
          
          {!collapsed && <> <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#0f766e",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 800,
            }}
          >
            FX
          </div> <Text style={{ fontWeight: 700 }}>FX Exchange</Text></>}
        </FlexLayout>

      </FlexLayout>

      <nav style={{ padding: 10 }}>
        <StackLayout gap={1}>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              style={({ isActive }) => ({
                textDecoration: "none",
                display: "block",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid transparent",
                background: isActive ? "#ecfeff" : "transparent",
                color: it.disabled ? "#9ca3af" : "#111827",
                pointerEvents: it.disabled ? "none" : "auto",
                fontWeight: isActive ? 700 : 500,
              })}
            >
              {collapsed ? it.label.slice(0, 2).toUpperCase() : it.label}
            </NavLink>
          ))}
        </StackLayout>
      </nav>
    </aside>
  );
}