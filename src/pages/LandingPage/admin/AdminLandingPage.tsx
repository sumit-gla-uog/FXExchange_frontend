import { Outlet, useNavigate } from "react-router-dom"
import { fetcher } from "../../../api/swr"
import { logout } from "../../../api/auth"
import { getAccessToken } from "../../../api/client"
import useSWR from "swr"
import { FlexLayout, StackLayout, Text } from "@salt-ds/core"
import { SettingsIcon, TriangleRightIcon } from "@salt-ds/icons"

export const AdminLandingPage = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  const { data, error, isLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher
  )

  if (isLoading) return <p>Loading...</p>;

  if (error || !data?.user) {
    logout()
    navigate("/login", { replace: true })
    return null
  }

  if (data.user.role !== "admin") {
    navigate("/customer", { replace: true })
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/*Top Nav*/}
      <div
        style={{
          background: "#0f172a",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <FlexLayout align="center" gap={2}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => navigate("/admin/dashboard")}
          >
            <SettingsIcon size={2} />
          </div>
          <StackLayout gap={0}>
            <Text style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
              FX Admin Panel
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              Welcome, {data.user.username}
            </Text>
          </StackLayout>
        </FlexLayout>

        <FlexLayout align="center" gap={3}>
         
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
           <TriangleRightIcon size={1} />
            Logout
          </button>
        </FlexLayout>
      </div>

      {/* Page Content via Outlet */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Outlet />
      </div>
    </div>
  );
};