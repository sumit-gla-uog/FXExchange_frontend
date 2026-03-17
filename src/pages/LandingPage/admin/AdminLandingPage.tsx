import { Outlet, useNavigate } from "react-router-dom"
import { fetcher } from "../../../api/swr"
import { logout } from "../../../api/auth"
import { getAccessToken } from "../../../api/client"
import useSWR from "swr"
import { FlexLayout, StackLayout, Text } from "@salt-ds/core"
import { SettingsIcon, TriangleRightIcon } from "@salt-ds/icons"
import "./AdminLandingPage.css"

export const AdminLandingPage = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  const { data, error, isLoading } = useSWR(token ? "/api/v1/auth/me/" : null, fetcher)

  if (isLoading) return <p>Loading...</p>

  if (error || !data?.user) {
    logout()
    navigate("/login", { replace: true })
    return null
  }

  if (data.user.role !== "admin") {
    navigate("/customer", { replace: true })
    return null
  }

  const handleLogout = () => { logout(); navigate("/login", { replace: true }) }

  return (
    <div className="admin-page">
      <div className="admin-nav">
        <FlexLayout align="center" gap={2}>
          <div className="admin-nav__logo" onClick={() => navigate("/admin/dashboard")}>
            <SettingsIcon size={2} />
          </div>
          <StackLayout gap={0}>
            <Text className="admin-nav__title">FX Admin Panel</Text>
            <Text className="admin-nav__subtitle">Welcome, {data.user.username}</Text>
          </StackLayout>
        </FlexLayout>
        <FlexLayout align="center" gap={3}>
          <button className="admin-nav__logout" onClick={handleLogout}>
            <TriangleRightIcon size={1} /> Logout
          </button>
        </FlexLayout>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}