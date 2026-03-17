import useSWR from "swr"
import { useNavigate } from "react-router-dom"
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Button,
  Spinner,
} from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { CurrencyCard } from "../../../components/Ui/CurrencyCard";

interface DashboardSummary {
  portfolio_value_gbp: string
  num_currencies: number
  change_24h_pct: string
  change_24h_gbp: string
}

interface MarketPair {
  pair: string
  base_flag: string
  quote_flag: string
  rate: string
  change_pct: string
}

interface MarketSnapshot {
  market_snapshot: MarketPair[]
}

interface PortfolioHolding {
  currency: { code: string; name: string; symbol: string; flag: string }
  amount: string
  avg_buy_rate: string
  gbp_value: string | null
}

interface Portfolio {
  holdings: PortfolioHolding[]
  total_value_gbp: string
}

interface OrdersResponse {
  orders: { id: number; status: string }[];
}

const StatCard = ({
  label,
  value,
  sub,
  onClick,
  children,
}: {
  label: string
  value?: string
  sub?: string
  onClick?: () => void
  children?: React.ReactNode
}) => (
  <Card
    onClick={onClick}
    style={{
      flex: 1,
      minWidth: 180,
      padding: "24px 28px",
      borderRadius: 12,
      background: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      border: "1px solid #e5e7eb",
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.15s",
    }}
  >
    <StackLayout gap={0}>
      <Text styleAs="label" style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, letterSpacing: "0.02em" }}>
        {label}
      </Text>
      {children ?? (
        <>
          <Text style={{ fontSize: 32, fontWeight: 400, color: "#111827", lineHeight: 1.15, paddingTop: 8 }}>
            {value}
          </Text>
          {sub && (
            <Text styleAs="label" style={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }}>
              {sub}
            </Text>
          )}
        </>
      )}
    </StackLayout>

  </Card>
)

export const DashboardPage = () => {
  const navigate = useNavigate()

  const { data: summary, isLoading: loadingSummary, error: summaryError } =
    useSWR<DashboardSummary>("/api/v1/dashboard/summary/", fetcher)
  const isApiOnline = !summaryError

  console.log("summary", summary)
  const { data: snapshot, isLoading: loadingSnapshot, error: snapshotError } =
    useSWR<MarketSnapshot>("/api/v1/dashboard/market-snapshot/", fetcher)

  console.log("snapshot error:", snapshotError)

  const { data: portfolio } = useSWR<Portfolio>("/api/v1/portfolio/", fetcher)

  const { data: ordersData } = useSWR<OrdersResponse>("/api/v1/orders/?status=open", fetcher)
  console.log("checking Orders data:", ordersData)

  const gbpHolding = portfolio?.holdings.find(
    (h) => h.currency.code === "GBP"
  )

  console.log("gbpHolding value", gbpHolding)
  const openOrders = ordersData?.orders?.length ?? 0

  console.log("openOrders:", openOrders)
  console.log("snapshot data:", snapshot)
  console.log("loading:", loadingSnapshot)
  return (
    <StackLayout gap={3}>
      <FlexLayout gap={2} wrap>

        {/* Portfolio Value */}
        <StatCard
          label="Portfolio Value"
          onClick={() => navigate("/customer/portfolio")}
          value={
            loadingSummary
              ? "..."
              : `${parseFloat(summary?.portfolio_value_gbp ?? "0").toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
          }
          sub="GBP"
        />

        {/* GBP Balance */}
        <StatCard
          label="GBP Balance"
          value={
            gbpHolding
              ? parseFloat(gbpHolding.amount).toLocaleString("en-GB", {
                minimumFractionDigits: 2,
              })
              : "0.00"
          }
          sub="GBP"
        />

        {/* Open Orders */}
        <StatCard label="Open Orders" value={String(openOrders)} sub="Active" />

        {/* API Status  */}
        <StatCard label="API Status">
          <FlexLayout align="center" gap={1}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: isApiOnline ? "#22c55e" : "#ef4444",
              flexShrink: 0,
            }} />
            <Text style={{ fontWeight: 600, color: "#111827" }}>
              {isApiOnline ? "Online" : "Offline"}
            </Text>
          </FlexLayout>
          <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
            {isApiOnline ? "All systems operational" : "Cannot reach server"}
          </Text>
        </StatCard>

      </FlexLayout>

      {/* Market Snapshot par t*/}
      <Card
        style={{
          padding: "20px 24px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <FlexLayout justify="space-between" align="center">
          <StackLayout gap={0}>
            <Text style={{ fontWeight: 600, fontSize: 17, color: "#111827", letterSpacing: "-0.01em" }}>
              Market Snapshot
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }}>
              Top currencies vs GBP
            </Text>
          </StackLayout>
          <Button
            appearance="transparent"
            onClick={() => navigate("/customer/currencies")}
            style={{ color: "#0f766e", fontWeight: 600 }}
          >
            View All
          </Button>
        </FlexLayout>

        <div style={{ marginTop: 20 }}>
          {loadingSnapshot ? (
            <FlexLayout justify="center" style={{ padding: 32 }}>
              <Spinner />
            </FlexLayout>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {snapshot?.market_snapshot.map((item) => {
                const quoteCode = item.pair.split("/")[1]
                return (
                  <CurrencyCard
                    key={item.pair}
                    variant="compact"
                    data={{
                      code: quoteCode,
                      flag: item.quote_flag,
                      rate: parseFloat(item.rate),
                      changePct: parseFloat(item.change_pct),
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/*Quick Actions part*/}
      <Card
        style={{
          padding: "20px 24px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <Text style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
          Quick Actions
        </Text>
        <FlexLayout gap={2} wrap>
          <Button
            appearance="bordered"
            style={{
              flex: 1,
              minWidth: 160,
              padding: "14px 20px",
              borderRadius: 10,
              border: "1px solid #0f766e",
              color: "#0f766e",
              fontWeight: 600,
              justifyContent: "center",
            }}
            onClick={() => navigate("/customer/currencies")}
          >
            Browse Currencies
          </Button>

          <Button
            appearance="solid"
            sentiment="accented"
            style={{
              flex: 1,
              minWidth: 160,
              padding: "14px 20px",
              borderRadius: 10,
              background: "#0f766e",
              color: "white",
              fontWeight: 600,
              justifyContent: "center",
            }}
            onClick={() => navigate("/customer/pairs")}
          >
            View Trading Pairs
          </Button>

          <Button
            appearance="bordered"
            style={{
              flex: 1,
              minWidth: 160,
              padding: "14px 20px",
              borderRadius: 10,
              border: "1px solid #f59e0b",
              color: "#b45309",
              fontWeight: 600,
              justifyContent: "center",
            }}
            onClick={() => navigate("/customer/pairs")}
          >
            New Trade
          </Button>
        </FlexLayout>
      </Card>
    </StackLayout>
  )
}