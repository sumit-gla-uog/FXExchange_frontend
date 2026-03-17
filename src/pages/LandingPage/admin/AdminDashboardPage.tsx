import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { fetcher } from "../../../api/swr"
import { StackLayout, FlexLayout, Text, Card, Spinner } from "@salt-ds/core"
import { DatabaseIcon, TriangleUpIcon, SuccessTickIcon, ArrowRightIcon } from "@salt-ds/icons"
import type { FX } from "../../../types/FX"
import "./AdminDashboardPage.css"

const StatCard = ({ label, value, sub, subColor }: {
  label: string; value: string | number; sub?: string; subColor?: string
}) => (
  <Card className="dashboard-stat-card">
    <StackLayout gap={1}>
      <Text styleAs="label" className="dashboard-stat-card__label">{label}</Text>
      <Text className="dashboard-stat-card__value">{value}</Text>
      {sub && <Text styleAs="label" className="dashboard-stat-card__sub" style={{ color: subColor ?? "#6b7280" }}>{sub}</Text>}
    </StackLayout>
  </Card>
)

const ActionCard = ({ icon, title, description, linkText, onClick }: {
  icon: React.ReactNode; title: string; description: string; linkText: string; onClick: () => void
}) => (
  <Card className="dashboard-action-card">
    <StackLayout gap={2}>
      <FlexLayout align="center" gap={2}>
        <div className="dashboard-action-card__icon">{icon}</div>
        <StackLayout gap={2}>
          <Text className="dashboard-action-card__title">{title}</Text>
          <Text styleAs="label" className="dashboard-action-card__subtitle">{description}</Text>
        </StackLayout>
      </FlexLayout>
      <button className="dashboard-action-card__link" onClick={onClick}>
        {linkText} <ArrowRightIcon />
      </button>
    </StackLayout>
  </Card>
)

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useSWR<FX.Admin.DashboardData>("/api/v1/admin/dashboard/", fetcher)

  return (
    <div>
      <Text className="dashboard-page-title">Admin Dashboard</Text>
      {isLoading ? (
        <div className="dashboard-spinner"><Spinner /></div>
      ) : (
        <StackLayout gap={3}>
          <FlexLayout gap={2} wrap>
            <StatCard label="Total Currencies" value={data?.total_currencies ?? 0} sub={`${data?.enabled_currencies ?? 0} enabled`} subColor="#059669" />
            <StatCard label="Exchange Rates" value={data?.total_rates ?? 0} sub={`${data?.total_rates ?? 0} OK`} subColor="#059669" />
            <StatCard label="Stale Rates" value={data?.stale_rates ?? 0} sub="Need attention" subColor={data?.stale_rates ? "#f59e0b" : "#6b7280"} />
            <StatCard label="Unavailable" value={data?.unavailable_rates ?? 0} sub="Manual update needed" subColor={data?.unavailable_rates ? "#dc2626" : "#6b7280"} />
          </FlexLayout>

          <FlexLayout gap={2} wrap>
            <ActionCard icon={<DatabaseIcon size={2} />} title="Currency Management" description="Add, edit, and manage supported currencies" linkText="Manage Currencies" onClick={() => navigate("/admin/currencies")} />
            <ActionCard icon={<TriangleUpIcon size={2} />} title="Rate Management" description="Monitor API health and update rates manually" linkText="Manage Rates" onClick={() => navigate("/admin/rates")} />
          </FlexLayout>

          <Card className="dashboard-info-card">
            <Text className="dashboard-info-card__title">Admin Responsibilities</Text>
            <StackLayout gap={0.5}>
              {[
                "Maintain the Currency Master table with all HSBC-supported currencies",
                "Monitor rate API health and update rates manually when API fails",
                "Review and validate manual rate imports via CSV or manual entry",
                "Ensure audit logs are maintained for compliance",
              ].map((item) => (
                <FlexLayout key={item} align="center" gap={1}>
                  <SuccessTickIcon size={1} style={{ color: "#1d4ed8", flexShrink: 0 }} />
                  <Text className="dashboard-info-card__item">{item}</Text>
                </FlexLayout>
              ))}
            </StackLayout>
          </Card>
        </StackLayout>
      )}
    </div>
  )
}