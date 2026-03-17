import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useSWR, { mutate } from "swr"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { Card, FlexLayout, StackLayout, Text, Button, Spinner, Input, Dialog, DialogHeader, DialogContent, DialogActions } from "@salt-ds/core"
import { fetcher } from "../../api/swr"
import { apiFetch } from "../../api/client"
import type { FX } from "../../types/FX"
import "./PairDetailPage.css"
import { SuccessTickIcon } from '@salt-ds/icons';

type Period = "1h" | "1d" | "1w" | "1m"

interface PairLatest   { pair: FX.Customer.Pair }
interface HistoryPoint { rate: string; recorded_at: string }
interface PairHistory  { pair: string; period: string; history: HistoryPoint[] }

interface Portfolio {
  holdings: { currency: { code: string }; amount: string; gbp_value: string | null }[]
  total_value_gbp: string
}

// Market Exchange Modal
const MarketExchangeModal = ({ pair, portfolio, onClose }: { pair: FX.Customer.Pair; portfolio: Portfolio | undefined; onClose: () => void }) => {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const rate = parseFloat(pair.rate)
  const parsedAmount = parseFloat(amount) || 0
  const estimated = (parsedAmount * rate).toFixed(2)
  const available = parseFloat(portfolio?.holdings.find((h) => h.currency.code === pair.base.code)?.amount ?? "0")

  const handleExecute = async () => {
    if (!amount || parsedAmount <= 0) return setError("Valid amount daalo")
    if (parsedAmount > available) return setError("Insufficient balance")
    setLoading(true); setError("")
    try {
      await apiFetch("/api/v1/trades/market/", { method: "POST", auth: true, body: JSON.stringify({ pair_id: pair.id, side: "buy", amount }) })
      setSuccess(`Successfully exchanged ${amount} ${pair.base.code} - ${estimated} ${pair.quote.code}`)
      mutate("/api/v1/portfolio/"); mutate("/api/v1/dashboard/summary/"); mutate("/api/v1/trades/")
      setTimeout(() => onClose(), 1500)
    } catch (e: any) { setError(e.message || "Trade failed") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
      <DialogHeader header="Market Exchange" />
      <DialogContent>
        <StackLayout gap={2}>
          <div className="modal-pair-display">
            <FlexLayout align="center" gap={1.5}>
              <span className="modal-pair-flag">{pair.base.flag}</span>
              <StackLayout gap={0}>
                <Text className="modal-pair-code">{pair.base.code}</Text>
                <Text styleAs="label" className="modal-pair-name">{pair.base.name}</Text>
              </StackLayout>
              <Text className="modal-pair-arrow">→</Text>
              <span className="modal-pair-flag">{pair.quote.flag}</span>
              <StackLayout gap={0}>
                <Text className="modal-pair-code">{pair.quote.code}</Text>
                <Text styleAs="label" className="modal-pair-name">{pair.quote.name}</Text>
              </StackLayout>
            </FlexLayout>
          </div>

          <div className="modal-rate-box">
            <FlexLayout justify="space-between" align="center">
              <StackLayout gap={0}>
                <Text styleAs="label" className="modal-rate-label">Current Rate</Text>
                <Text className="modal-rate-value">1 {pair.base.code} = {rate.toFixed(4)} {pair.quote.code}</Text>
                <Text styleAs="label" className="modal-rate-time">Last updated: {new Date().toLocaleTimeString("en-GB")}</Text>
              </StackLayout>
              <Button appearance="transparent" className="modal-refresh-btn" onClick={() => mutate(`/api/v1/pairs/${pair.id}/latest/`)}>Refresh</Button>
            </FlexLayout>
          </div>

          <StackLayout gap={0.5}>
            <Text styleAs="label" className="modal-field-label">Amount to Exchange ({pair.base.code})</Text>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" type="number" style={{ width: "100%" }} />
            <Text styleAs="label" className="modal-field-hint">Available: {pair.base.symbol}{available.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</Text>
          </StackLayout>

          <div className="modal-estimate-box">
            <Text styleAs="label" className="modal-estimate-label">Estimated to Receive</Text>
            <Text className="modal-estimate-value">{pair.quote.symbol}{estimated} {pair.quote.code}</Text>
          </div>

          <div className="modal-info-box">
            <strong>Market Order:</strong> Your order will be executed immediately at the current market rate. The final rate will be confirmed at execution time.
          </div>

          {success ? (
            <FlexLayout direction="column" align="center" justify="center" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div className="modal-success-icon"><SuccessTickIcon/></div>
              <Text className="modal-success-title">Transaction Successful!</Text>
              <Text className="modal-success-sub">{success}</Text>
            </FlexLayout>
          ) : (
            <StackLayout gap={2}>
              {error && <Text className="modal-error">{error}</Text>}
            </StackLayout>
          )}
        </StackLayout>
      </DialogContent>
      {!success && (
        <DialogActions>
          <Button appearance="bordered" onClick={onClose}>Cancel</Button>
          <Button appearance="solid" className="modal-execute-btn" onClick={handleExecute} disabled={loading || !!success || parsedAmount <= 0}>
            {loading ? "Processing..." : "Execute Market Order"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

// Limit Order Modal 
const LimitOrderModal = ({ pair, portfolio, onClose }: { pair: FX.Customer.Pair; portfolio: Portfolio | undefined; onClose: () => void }) => {
  const [amount, setAmount] = useState("")
  const [limitRate, setLimitRate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const rate = parseFloat(pair.rate)
  const parsedAmount = parseFloat(amount) || 0
  const parsedRate = parseFloat(limitRate) || 0
  const estimated = (parsedAmount * parsedRate).toFixed(2)
  const available = parseFloat(portfolio?.holdings.find((h) => h.currency.code === pair.base.code)?.amount ?? "0")

  const handlePlace = async () => {
    if (!amount || parsedAmount <= 0) return setError("Valid amount daalo")
    if (!limitRate || parsedRate <= 0) return setError("Valid target rate daalo")
    setLoading(true); setError("")
    try {
      await apiFetch("/api/v1/orders/limit/", { method: "POST", auth: true, body: JSON.stringify({ pair_id: pair.id, side: "buy", amount, limit_rate: limitRate }) })
      setSuccess(`Limit order placed: ${amount} ${pair.base.code} at ${limitRate}`)
      mutate("/api/v1/orders/"); mutate("/api/v1/dashboard/summary/")
      setTimeout(() => onClose(), 1500)
    } catch (e: any) { setError(e.message || "Order failed") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
      <DialogHeader header="Place Limit Order" />
      <DialogContent>
        <StackLayout gap={2}>
          <div className="modal-pair-display">
            <FlexLayout align="center" gap={1.5}>
              <span className="modal-pair-flag">{pair.base.flag}</span>
              <StackLayout gap={0}>
                <Text className="modal-pair-code">{pair.base.code}</Text>
                <Text styleAs="label" className="modal-pair-name">{pair.base.name}</Text>
              </StackLayout>
              <Text className="modal-pair-arrow">→</Text>
              <span className="modal-pair-flag">{pair.quote.flag}</span>
              <StackLayout gap={0}>
                <Text className="modal-pair-code">{pair.quote.code}</Text>
                <Text styleAs="label" className="modal-pair-name">{pair.quote.name}</Text>
              </StackLayout>
            </FlexLayout>
          </div>

          <StackLayout gap={0.5}>
            <Text styleAs="label" className="modal-field-label">Amount to Exchange ({pair.base.code})</Text>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" type="number" style={{ width: "100%" }} />
            <Text styleAs="label" className="modal-field-hint">Available: {pair.base.symbol}{available.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</Text>
          </StackLayout>

          <StackLayout gap={0.5}>
            <Text styleAs="label" className="modal-field-label">Target Rate (1 {pair.base.code} = ? {pair.quote.code})</Text>
            <Input value={limitRate} onChange={(e) => setLimitRate(e.target.value)} placeholder="Enter target rate" type="number" style={{ width: "100%" }} />
            <Text styleAs="label" className="modal-field-hint">Current market rate: {rate.toFixed(4)}</Text>
          </StackLayout>

          <div className="modal-estimate-box">
            <Text styleAs="label" className="modal-estimate-label">Estimated to Receive</Text>
            <Text className="modal-estimate-value">{pair.quote.symbol}{estimated} {pair.quote.code}</Text>
          </div>

          <div className="modal-info-box">
            <strong>Limit Order:</strong> Your order will be executed automatically when the market rate reaches your target rate. You can cancel anytime before execution.
          </div>

          {success ? (
            <FlexLayout direction="column" align="center" justify="center" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div className="modal-success-icon">✅</div>
              <Text className="modal-success-title">Transaction Successful!</Text>
              <Text className="modal-success-sub">{success}</Text>
            </FlexLayout>
          ) : (
            <StackLayout gap={2}>
              {error && <Text className="modal-error">{error}</Text>}
            </StackLayout>
          )}
        </StackLayout>
      </DialogContent>
      {!success && (
        <DialogActions>
          <Button appearance="bordered" onClick={onClose}>Cancel</Button>
          <Button appearance="solid" className="modal-execute-btn" onClick={handlePlace} disabled={loading || !!success || parsedAmount <= 0 || parsedRate <= 0}>
            {loading ? "Placing..." : "Place Limit Order"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export const PairDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>("1d")
  const [showMarket, setShowMarket] = useState(false)
  const [showLimit, setShowLimit] = useState(false)

  const { data: tradesData } = useSWR<{ trades: any[] }>("/api/v1/trades/", fetcher)
  const { data: latestData, isLoading: loadingPair } = useSWR<PairLatest>(`/api/v1/pairs/${id}/latest/`, fetcher)
  const { data: historyData, isLoading: loadingHistory } = useSWR<PairHistory>(`/api/v1/pairs/${id}/history/?period=${period}`, fetcher)
  const { data: portfolio } = useSWR<Portfolio>("/api/v1/portfolio/", fetcher)

  const pair = latestData?.pair

  const pairTrades = useMemo(() => (tradesData?.trades ?? []).filter((t) => t.pair === pair?.pair), [tradesData, pair])
  const buyCount    = pairTrades.filter((t) => t.side === "buy").length
  const sellCount   = pairTrades.filter((t) => t.side === "sell").length
  const totalVolume = pairTrades.reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const history   = historyData?.history ?? []
  const chartData = history.map((h) => [new Date(h.recorded_at).getTime(), parseFloat(h.rate)])
  const todayHigh = chartData.length ? Math.max(...chartData.map((d) => d[1])) : 0
  const todayLow  = chartData.length ? Math.min(...chartData.map((d) => d[1])) : 0

  const chartOptions: Highcharts.Options = {
    chart: { type: "spline", backgroundColor: "white", height: 300, style: { fontFamily: "inherit" } },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { type: "datetime", lineColor: "#e5e7eb", tickColor: "#e5e7eb", labels: { style: { color: "#6b7280", fontSize: "11px" } } },
    yAxis: { title: { text: null }, gridLineColor: "#f3f4f6", labels: { style: { color: "#6b7280", fontSize: "11px" } } },
    tooltip: { xDateFormat: "%d %b %Y %H:%M", valueDecimals: 4, backgroundColor: "#1f2937", style: { color: "white" }, borderWidth: 0, borderRadius: 8 },
    series: [{ type: "spline", name: pair?.pair ?? "Rate", data: chartData, color: "#0f766e", lineWidth: 2, marker: { enabled: false } }],
  }

  if (loadingPair) return <FlexLayout justify="center" style={{ padding: 80 }}><Spinner /></FlexLayout>

  if (!pair) return (
    <Card className="pair-detail-card">
      <Text>Pair not found.</Text>
      <Button onClick={() => navigate("/customer/pairs")}>← Back</Button>
    </Card>
  )

  return (
    <StackLayout gap={3}>
      <FlexLayout justify="space-between" align="center" wrap gap={1}>
        <FlexLayout align="center" gap={2}>
          <Button appearance="transparent" className="pair-detail-back-btn" onClick={() => navigate("/customer/pairs")}>Back</Button>
          <Text className="pair-detail-last-updated">Last updated: {new Date().toLocaleTimeString("en-GB")}</Text>
        </FlexLayout>
        <FlexLayout gap={1}>
          <Button appearance="solid" className="pair-detail-market-btn" onClick={() => setShowMarket(true)}>Market Exchange</Button>
          <Button appearance="bordered" className="pair-detail-limit-btn" onClick={() => setShowLimit(true)}>Place Limit Order</Button>
        </FlexLayout>
      </FlexLayout>

      <Card className="pair-detail-card">
        <FlexLayout justify="space-between" align="flex-start" wrap>
          <StackLayout gap={0.5}>
            <Text styleAs="label" className="pair-detail-rate-label">Current Rate</Text>
            <Text className="pair-detail-rate-value">{parseFloat(pair.rate).toFixed(4)}</Text>
            <Text styleAs="label" className="pair-detail-rate-sub">1 {pair.base.code} = {parseFloat(pair.rate).toFixed(4)} {pair.quote.code}</Text>
          </StackLayout>
          <FlexLayout gap={4}>
            <StackLayout gap={0}>
              <FlexLayout align="center" gap={0.5}>
                <Text className="pair-detail-high-arrow">↗</Text>
                <Text styleAs="label" className="pair-detail-high-label">Today High</Text>
              </FlexLayout>
              <Text className="pair-detail-stat-value">{todayHigh.toFixed(4)}</Text>
            </StackLayout>
            <StackLayout gap={0}>
              <FlexLayout align="center" gap={0.5}>
                <Text className="pair-detail-low-arrow">↘</Text>
                <Text styleAs="label" className="pair-detail-low-label">Today Low</Text>
              </FlexLayout>
              <Text className="pair-detail-stat-value">{todayLow.toFixed(4)}</Text>
            </StackLayout>
          </FlexLayout>
        </FlexLayout>
      </Card>

      <Card className="pair-detail-card">
        <FlexLayout justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Text className="pair-detail-chart-title">Rate History</Text>
          <FlexLayout gap={1}>
            {(["1h", "1d", "1w", "1m"] as Period[]).map((p) => (
              <button key={p} className={`pair-detail-period-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </FlexLayout>
        </FlexLayout>
        {loadingHistory ? (
          <div className="pair-detail-chart-spinner"><Spinner /></div>
        ) : history.length === 0 ? (
          <div className="pair-detail-chart-empty"><Text style={{ color: "#9ca3af" }}>No history data available</Text></div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </Card>

      <Card className="pair-detail-card">
        <Text className="pair-detail-activity-title">Market Activity</Text>
        <Text styleAs="label" className="pair-detail-activity-disclaimer">^ Buy/Sell counts are based on your personal trade history.</Text>
        <FlexLayout gap={6}>
          <StackLayout gap={0}>
            <Text styleAs="label" className="pair-detail-activity-label">Buy Count</Text>
            <Text className="pair-detail-buy-count">{buyCount}</Text>
          </StackLayout>
          <StackLayout gap={0}>
            <Text styleAs="label" className="pair-detail-activity-label">Sell Count</Text>
            <Text className="pair-detail-sell-count">{sellCount}</Text>
          </StackLayout>
          <StackLayout gap={0}>
            <Text styleAs="label" className="pair-detail-activity-label">Total Volume</Text>
            <Text className="pair-detail-volume">{totalVolume.toLocaleString("en-GB", { minimumFractionDigits: 0 })}</Text>
          </StackLayout>
        </FlexLayout>
      </Card>

      <Card className="pair-detail-card">
        <Text className="pair-detail-trades-title">Recent Trades</Text>
        {pairTrades.length === 0 ? (
          <Text className="pair-detail-trades-empty">No trades yet for this pair.</Text>
        ) : (
          <table className="pair-detail-trades-table">
            <thead>
              <tr>{["ID", "Type", "Amount", "Rate", "Total", "Timestamp"].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pairTrades.slice(0, 10).map((t) => (
                <tr key={t.id}>
                  <td className="muted">{t.id}</td>
                  <td className={t.side === "buy" ? "side-buy" : "side-sell"}>{t.side}</td>
                  <td>{parseFloat(t.amount).toLocaleString("en-GB")}</td>
                  <td>{parseFloat(t.rate).toFixed(4)}</td>
                  <td>{parseFloat(t.total).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td>
                  <td className="muted">{new Date(t.executed_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="pair-detail-disclaimer">
        <strong>Disclaimer:</strong> This is a reference-only platform. Not financial advice. Bank fees may apply for real transactions. All trades are simulated within this platform.
      </div>

      {showMarket && <MarketExchangeModal pair={pair} portfolio={portfolio} onClose={() => setShowMarket(false)} />}
      {showLimit  && <LimitOrderModal    pair={pair} portfolio={portfolio} onClose={() => setShowLimit(false)} />}
    </StackLayout>
  )
}