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
  children,
}: {
  label: string
  value?: string
  sub?: string
  children?: React.ReactNode
}) => (
  <Card
    style={{
      flex: 1,
      minWidth: 180,
      padding: "20px 24px",
      borderRadius: 12,
      background: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      border: "1px solid #e5e7eb",
    }}
  >
    <StackLayout gap={0.5}>
      <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
        {label}
      </Text>
      {children ?? (
        <>
          <Text style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
            {value}
          </Text>
          {sub && (
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
              {sub}
            </Text>
          )}
        </>
      )}
    </StackLayout>
  </Card>
);

const PairCard = ({ item }: { item: MarketPair }) => {
  const pct = parseFloat(item.change_pct)
  const isPositive = pct >= 0
  return (
    <div
      style={{
        minWidth: 140,
        padding: "20px 16px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        textAlign: "center",
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 36 }}>{item.base_flag}</div>
      <Text style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
        {item.pair.split("/")[0]}
      </Text>
      <Text style={{ fontSize: 13, color: "#374151" }}>
        {parseFloat(item.rate).toFixed(4)}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isPositive ? "#059669" : "#dc2626",
        }}
      >
        {isPositive ? "↗ +" : "↘ "}
        {pct.toFixed(2)}%
      </Text>
    </div>
  );
};

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

  const { data: ordersData } = useSWR<OrdersResponse>("/api/v1/orders/?status=open",fetcher)
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
            <Text style={{ fontWeight: 700, fontSize: 18 }}>
              Market Snapshot
            </Text>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
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
              {snapshot?.market_snapshot.map((item) => (
                <PairCard key={item.pair} item={item} />
              ))}
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