import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { fetcher } from "../../../api/swr"
import { logout } from "../../../api/auth"
import { getAccessToken } from "../../../api/client"
import { StackLayout, FlexLayout, Text, Card, Spinner } from "@salt-ds/core"
import {
  SettingsIcon,
  TriangleRightIcon,
  DatabaseIcon,
  TriangleUpIcon,
  SuccessTickIcon,
  ArrowRightIcon,
} from "@salt-ds/icons"

interface AdminDashboardData {
  total_currencies: number
  enabled_currencies: number
  total_pairs: number
  total_rates: number
  stale_rates: number
  unavailable_rates: number
  api_status: string
  last_check: string | null
  uptime_pct: string
}

// Stats Card 
const StatCard = ({
  label,
  value,
  sub,
  subColor,
}: {
  label: string
  value: string | number
  sub?: string
  subColor?: string
}) => (
  <Card
    style={{
      flex: 1,
      minWidth: 200,
      padding: "24px 28px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}
  >
    <StackLayout gap={0.5}>
      <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
        {value}
      </Text>
      {sub && (
        <Text styleAs="label" style={{ color: subColor ?? "#6b7280", fontSize: 12, fontWeight: 600 }}>
          {sub}
        </Text>
      )}
    </StackLayout>
  </Card>
)

// Actions Card
const ActionCard = ({
  icon,
  title,
  description,
  linkText,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  linkText: string
  onClick: () => void
}) => (
  <Card
    style={{
      flex: 1,
      padding: "28px 32px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}
  >
    <StackLayout gap={2}>
      <FlexLayout align="center" gap={2}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "#f0fdf9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f766e",
          }}
        >
          {icon}
        </div>
        <StackLayout gap={0}>
          <Text style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{title}</Text>
          <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
            {description}
          </Text>
        </StackLayout>
      </FlexLayout>
      <button
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          color: "#0f766e",
          fontWeight: 600,
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
      >
        {linkText} <ArrowRightIcon/>
      </button>
    </StackLayout>
  </Card>
);

// Landing page
export const AdminLandingPage = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  // Auth & role guard
  const { data: meData, error: meError, isLoading: meLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher
  )

  const { data, isLoading } = useSWR<AdminDashboardData>(
    "/api/v1/admin/dashboard/",
    fetcher
  )

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  if (meLoading) return <p>Loading...</p>

  if (meError || !meData?.user) {
    logout()
    navigate("/login", { replace: true })
    return null;
  }

  if (meData.user.role !== "admin") {
    navigate("/customer", { replace: true })
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Nav bar */}
      <div
        style={{
          background: "#0f172a",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            }}
          >
            <SettingsIcon size={2} />
          </div>
          <StackLayout gap={0}>
            <Text style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
              FX Admin Panel
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              Welcome, {meData.user.username}
            </Text>
          </StackLayout>
        </FlexLayout>

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
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <TriangleRightIcon size={1} />
          Logout
        </button>
      </div>

      {/* Landing page Content*/}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Text style={{ fontWeight: 700, fontSize: 22, color: "#111827", marginBottom: 24 }}>
          Admin Dashboard
        </Text>

        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 80 }}>
            <Spinner />
          </FlexLayout>
        ) : (
          <StackLayout gap={3}>
            {/* Implementing Stats Cards */}
            <FlexLayout gap={2} wrap>
              <StatCard
                label="Total Currencies"
                value={data?.total_currencies ?? 0}
                sub={`${data?.enabled_currencies ?? 0} enabled`}
                subColor="#059669"
              />
              <StatCard
                label="Exchange Rates"
                value={data?.total_rates ?? 0}
                sub={`${data?.total_rates ?? 0} OK`}
                subColor="#059669"
              />
              <StatCard
                label="Stale Rates"
                value={data?.stale_rates ?? 0}
                sub="Need attention"
                subColor={data?.stale_rates ? "#f59e0b" : "#6b7280"}
              />
              <StatCard
                label="Unavailable"
                value={data?.unavailable_rates ?? 0}
                sub="Manual update needed"
                subColor={data?.unavailable_rates ? "#dc2626" : "#6b7280"}
              />
            </FlexLayout>

            {/* Implementing action cards */}
            <FlexLayout gap={2} wrap>
              <ActionCard
                icon={<DatabaseIcon size={2} />}
                title="Currency Management"
                description="Add, edit, and manage supported currencies"
                linkText="Manage Currencies"
                onClick={() => navigate("/admin/currencies")}
              />
              <ActionCard
                icon={<TriangleUpIcon size={2} />}
                title="Rate Management"
                description="Monitor API health and update rates manually"
                linkText="Manage Rates"
                onClick={() => navigate("/admin/rates")}
              />
            </FlexLayout>

            {/* Admin responsibilities notice part*/}
            <Card
              style={{
                padding: "24px 28px",
                borderRadius: 12,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
              }}
            >
              <Text style={{ fontWeight: 700, fontSize: 16, color: "#1e40af", marginBottom: 12 }}>
                Admin Responsibilities
              </Text>
              <StackLayout gap={0.5}>
                {[
                  "Maintain the Currency Master table with all HSBC-supported currencies",
                  "Monitor rate API health and update rates manually when API fails",
                  "Review and validate manual rate imports via CSV or manual entry",
                  "Ensure audit logs are maintained for compliance",
                ].map((item) => (
                  <FlexLayout key={item} align="center" gap={1}>
                    <SuccessTickIcon size={1} style={{ color: "#1d4ed8", flexShrink: 0 }} />
                    <Text style={{ color: "#1d4ed8", fontSize: 13 }}>{item}</Text>
                  </FlexLayout>
                ))}
              </StackLayout>
            </Card>
          </StackLayout>
        )}
      </div>
    </div>
  )
}