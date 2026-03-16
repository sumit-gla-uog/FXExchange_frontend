import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FlexLayout, Text, Button } from "@salt-ds/core";
import { CustomerSidebar } from "./CustomerSidebar"
import { logout } from "../../../api/auth";

export const  CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f6f7f9" }}>
      <CustomerSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: "#0f766e", padding: "18px 24px" }}>
          <FlexLayout justify="space-between" align="center" wrap>
            <div>
              <Text style={{ color: "white", fontSize: 24, fontWeight: 800 }}>Customer</Text>
              <Text variant="secondary" style={{ color: "#d1fae5" }}>
                Dashboard Area
              </Text>
            </div>

            <FlexLayout gap={1} align="center">
              {/* <Button appearance="solid" sentiment="accented" onClick={() => navigate("/customer/pairs")}>
                New Trade
              </Button> */}
              <Button appearance="secondary" style={{ color: "white", fontSize: 16 }} onClick={handleLogout}>
                Logout
              </Button>
            </FlexLayout>
          </FlexLayout>
        </div>

        {/* Page content */}
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}