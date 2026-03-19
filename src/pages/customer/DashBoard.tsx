import { useNavigate } from "react-router-dom"
import { Card, FlexLayout, StackLayout, Text, Button, Spinner } from "@salt-ds/core"
import { CurrencyCard } from "../../components/ui/CurrencyCard"
import { StatCard } from "../../components/ui/StatCard"
import { useDashboard } from "../../hooks/customer/useDashboard"
import "./Dashboard.css"

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { summary, snapshot, gbpHolding, openOrders, isApiOnline, loadingSummary, loadingSnapshot } = useDashboard()

  return (
    <StackLayout gap={3}>
      <FlexLayout gap={2} wrap>
        <StatCard
          label="Portfolio Value"
          onClick={() => navigate("/customer/portfolio")}
          value={loadingSummary ? "..." : parseFloat(summary?.portfolio_value_gbp ?? "0").toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          sub="GBP"
        />
        <StatCard
          label="GBP Balance"
          value={gbpHolding ? parseFloat(gbpHolding.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 }) : "0.00"}
          sub="GBP"
        />
        <StatCard label="Open Orders" value={String(openOrders)} sub="Active" />
        <StatCard label="API Status">
          <FlexLayout align="center" gap={1}>
            <div className={`dashboard-status-dot ${isApiOnline ? "online" : "offline"}`} />
            <Text className="dashboard-status-text">{isApiOnline ? "Online" : "Offline"}</Text>
          </FlexLayout>
          <Text className="dashboard-status-sub">
            {isApiOnline ? "All systems operational" : "Cannot reach server"}
          </Text>
        </StatCard>
      </FlexLayout>

      <Card className="dashboard-card">
        <FlexLayout justify="space-between" align="center">
          <StackLayout gap={0}>
            <Text className="dashboard-snapshot-title">Market Snapshot</Text>
            <Text className="dashboard-snapshot-sub">Top currencies vs GBP</Text>
          </StackLayout>
          <Button appearance="transparent" className="dashboard-snapshot-view-all" onClick={() => navigate("/customer/currencies")}>
            View All
          </Button>
        </FlexLayout>
        <div className="dashboard-snapshot-scroll">
          {loadingSnapshot ? (
            <FlexLayout justify="center" style={{ padding: 32 }}><Spinner /></FlexLayout>
          ) : (
            snapshot?.market_snapshot.map((item) => {
              const quoteCode = item.pair.split("/")[1]
              return (
                <CurrencyCard
                  key={item.pair}
                  variant="compact"
                  data={{ code: quoteCode, rate: parseFloat(item.rate), changePct: parseFloat(item.change_pct) }}
                />
              )
            })
          )}
        </div>
      </Card>

      <Card className="dashboard-card">
        <Text className="dashboard-quick-actions-title">Quick Actions</Text>
        <FlexLayout gap={2} wrap>
          <Button appearance="bordered" className="dashboard-action-btn browse" onClick={() => navigate("/customer/currencies")}>Browse Currencies</Button>
          <Button appearance="solid" sentiment="accented" className="dashboard-action-btn pairs" onClick={() => navigate("/customer/pairs")}>View Trading Pairs</Button>
          <Button appearance="bordered" className="dashboard-action-btn trade" onClick={() => navigate("/customer/pairs")}>New Trade</Button>
        </FlexLayout>
      </Card>
    </StackLayout>
  )
}