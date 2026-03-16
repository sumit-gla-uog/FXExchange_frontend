import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useSWR, { mutate } from "swr"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import {
    Card,
    FlexLayout,
    StackLayout,
    Text,
    Button,
    Spinner,
    Input,
    Dialog,
    DialogHeader,
    DialogContent,
    DialogActions,
} from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"


type Period = "1h" | "1d" | "1w" | "1m"

interface PairDetail {
    id: number
    pair: string
    base: { code: string; name: string; symbol: string; flag: string }
    quote: { code: string; name: string; symbol: string; flag: string }
    rate: string
    change_pct: string
}

interface PairLatest {
    pair: PairDetail
}

interface HistoryPoint {
    rate: string
    recorded_at: string
}

interface PairHistory {
    pair: string
    period: string
    history: HistoryPoint[]
}

interface Portfolio {
    holdings: {
        currency: { code: string }
        amount: string
        gbp_value: string | null
    }[]
    total_value_gbp: string
}


const MarketExchangeModal = ({
    pair,
    portfolio,
    onClose,
}: {
    pair: PairDetail
    portfolio: Portfolio | undefined
    onClose: () => void
}) => {
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const rate = parseFloat(pair.rate)
    const parsedAmount = parseFloat(amount) || 0
    const estimated = (parsedAmount * rate).toFixed(2)

    const gbpHolding = portfolio?.holdings.find(
        (h) => h.currency.code === pair.base.code
    )
    const available = gbpHolding ? parseFloat(gbpHolding.amount) : 0

    const handleExecute = async () => {
        if (!amount || parsedAmount <= 0) return setError("Valid amount daalo")
        if (parsedAmount > available) return setError("Insufficient balance")
        setLoading(true)
        setError("")
        try {
            await apiFetch("/api/v1/trades/market/", {
                method: "POST",
                auth: true,
                body: JSON.stringify({ pair_id: pair.id, side: "buy", amount }),
            })
            setSuccess(`Successfully exchanged ${amount} ${pair.base.code} - ${estimated} ${pair.quote.code}`)
            mutate("/api/v1/portfolio/")
            mutate("/api/v1/dashboard/summary/")
            mutate("/api/v1/trades/")

            setTimeout(() => onClose(), 1500);
        } catch (e: any) {
            setError(e.message || "Trade failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
            <DialogHeader header="Market Exchange" />
            <DialogContent>
                <StackLayout gap={2}>
                    {/* Pair display */}
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                        <FlexLayout align="center" gap={1.5}>
                            <span style={{ fontSize: 24 }}>{pair.base.flag}</span>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 700 }}>{pair.base.code}</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>{pair.base.name}</Text>
                            </StackLayout>
                            <Text style={{ color: "#6b7280", margin: "0 8px" }}>→</Text>
                            <span style={{ fontSize: 24 }}>{pair.quote.flag}</span>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 700 }}>{pair.quote.code}</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>{pair.quote.name}</Text>
                            </StackLayout>
                        </FlexLayout>
                    </div>

                    {/* Rate aprt */}
                    <div style={{ background: "#f0fdf9", borderRadius: 10, padding: "14px 16px", border: "1px solid #ccfbf1" }}>
                        <FlexLayout justify="space-between" align="center">
                            <StackLayout gap={0}>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>Current Rate</Text>
                                <Text style={{ fontWeight: 500, fontSize: 14, color: "#0f766e" }}>
                                    1 {pair.base.code} = {rate.toFixed(4)} {pair.quote.code}
                                </Text>
                                <Text styleAs="label" style={{ color: "#9ca3af", fontSize: 11 }}>
                                    Last updated: {new Date().toLocaleTimeString("en-GB")}
                                </Text>
                            </StackLayout>
                            <Button appearance="transparent" style={{ color: "#0f766e", fontSize: 12 }}
                                onClick={() => mutate(`/api/v1/pairs/${pair.id}/latest/`)}>
                                Refresh
                            </Button>
                        </FlexLayout>
                    </div>

                    {/*Exchange amount */}
                    <StackLayout gap={0.5}>
                        <Text styleAs="label" style={{ fontSize: 13 }}>
                            Amount to Exchange ({pair.base.code})
                        </Text>
                        <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            type="number"
                            style={{ width: "100%" }}
                        />
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
                            Available: {pair.base.symbol}{available.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </Text>
                    </StackLayout>

                    {/* Estimate amunt to receive */}
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>Estimated to Receive</Text>
                        <Text style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>
                            {pair.quote.symbol}{estimated} {pair.quote.code}
                        </Text>
                    </div>

                    <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                        <Text style={{ fontSize: 12, color: "#1d4ed8" }}>
                            <strong>Market Order:</strong> Your order will be executed immediately at the current market rate. The final rate will be confirmed at execution time.
                        </Text>
                    </div>

                    {/* {error && <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>}
                    {success && <Text style={{ color: "#059669", fontSize: 13 }}>{success}</Text>} */}
                    {success ? (
                        // Success scenario
                        <FlexLayout direction="column" align="center" justify="center" style={{ padding: "40px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}></div>
                            <Text style={{ fontWeight: 700, fontSize: 18, color: "#059669", marginBottom: 8 }}>
                                Transaction Successful!
                            </Text>
                            <Text style={{ color: "#6b7280", fontSize: 14 }}>{success}</Text>
                        </FlexLayout>
                    ) : (
                        // Error scenario
                        <StackLayout gap={2}>
                            {error && <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>}
                        </StackLayout>
                    )}
                </StackLayout>
            </DialogContent>
            {!success && (
                <DialogActions>
                    <Button appearance="bordered" onClick={onClose}>Cancel</Button>
                    <Button
                        appearance="solid"
                        onClick={handleExecute}
                        disabled={loading || !!success || parsedAmount <= 0}
                        style={{ background: "#0f766e", color: "white" }}
                    >
                        {loading ? "Processing..." : "Execute Market Order"}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    )
}


const LimitOrderModal = ({
    pair,
    portfolio,
    onClose,
}: {
    pair: PairDetail
    portfolio: Portfolio | undefined
    onClose: () => void
}) => {
    const [amount, setAmount] = useState("")
    const [limitRate, setLimitRate] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const rate = parseFloat(pair.rate)
    const parsedAmount = parseFloat(amount) || 0
    const parsedRate = parseFloat(limitRate) || 0
    const estimated = (parsedAmount * parsedRate).toFixed(2)

    const gbpHolding = portfolio?.holdings.find(
        (h) => h.currency.code === pair.base.code
    )
    const available = gbpHolding ? parseFloat(gbpHolding.amount) : 0

    const handlePlace = async () => {
        if (!amount || parsedAmount <= 0) return setError("Valid amount daalo")
        if (!limitRate || parsedRate <= 0) return setError("Valid target rate daalo")
        setLoading(true)
        setError("")
        try {
            await apiFetch("/api/v1/orders/limit/", {
                method: "POST",
                auth: true,
                body: JSON.stringify({ pair_id: pair.id, side: "buy", amount, limit_rate: limitRate }),
            })
            setSuccess(`Limit order placed: ${amount} ${pair.base.code} at ${limitRate}`)
            mutate("/api/v1/orders/")
            mutate("/api/v1/dashboard/summary/")

            setTimeout(() => onClose(), 1500);
        } catch (e: any) {
            setError(e.message || "Order failed")
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
            <DialogHeader header="Place Limit Order" />
            <DialogContent>
                <StackLayout gap={2}>
                    {/* displaying pair */}
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                        <FlexLayout align="center" gap={1.5}>
                            <span style={{ fontSize: 24 }}>{pair.base.flag}</span>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 700 }}>{pair.base.code}</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>{pair.base.name}</Text>
                            </StackLayout>
                            <Text style={{ color: "#6b7280", margin: "0 8px" }}>→</Text>
                            <span style={{ fontSize: 24 }}>{pair.quote.flag}</span>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 700 }}>{pair.quote.code}</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>{pair.quote.name}</Text>
                            </StackLayout>
                        </FlexLayout>
                    </div>

                    {/* Exchange amount */}
                    <StackLayout gap={0.5}>
                        <Text styleAs="label" style={{ fontSize: 13 }}>Amount to Exchange ({pair.base.code})</Text>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount" type="number" style={{ width: "100%" }} />
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
                            Available: {pair.base.symbol}{available.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </Text>
                    </StackLayout>

                    {/* Target rate */}
                    <StackLayout gap={0.5}>
                        <Text styleAs="label" style={{ fontSize: 13 }}>
                            Target Rate (1 {pair.base.code} = ? {pair.quote.code})
                        </Text>
                        <Input value={limitRate} onChange={(e) => setLimitRate(e.target.value)}
                            placeholder="Enter target rate" type="number" style={{ width: "100%" }} />
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
                            Current market rate: {rate.toFixed(4)}
                        </Text>
                    </StackLayout>

                    {/* Estimated amunt to recive */}
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>Estimated to Receive</Text>
                        <Text style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>
                            {pair.quote.symbol}{estimated} {pair.quote.code}
                        </Text>
                    </div>

                    <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                        <Text style={{ fontSize: 12, color: "#1d4ed8" }}>
                            <strong>Limit Order:</strong> Your order will be executed automatically when the market rate reaches or exceeds your target rate. You can cancel anytime before execution.
                        </Text>
                    </div>

                    {/* {error && <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>}
                    {success && <Text style={{ color: "#059669", fontSize: 13 }}>{success}</Text>} */}

                    {success ? (
                        // Success scenario
                        <FlexLayout direction="column" align="center" justify="center" style={{ padding: "40px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}></div>
                            <Text style={{ fontWeight: 700, fontSize: 18, color: "#059669", marginBottom: 8 }}>
                                Transaction Successful!
                            </Text>
                            <Text style={{ color: "#6b7280", fontSize: 14 }}>{success}</Text>
                        </FlexLayout>
                    ) : (
                        //Error scenario
                        <StackLayout gap={2}>
                            {error && <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>}
                        </StackLayout>
                    )}
                </StackLayout>
            </DialogContent>
            {!success && (
                <DialogActions>
                    <Button appearance="bordered" onClick={onClose}>Cancel</Button>
                    <Button
                        appearance="solid"
                        onClick={handlePlace}
                        disabled={loading || !!success || parsedAmount <= 0 || parsedRate <= 0}
                        style={{ background: "#0f766e", color: "white" }}
                    >
                        {loading ? "Placing..." : "Place Limit Order"}
                    </Button>
                </DialogActions>)}
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



    const { data: latestData, isLoading: loadingPair } = useSWR<PairLatest>(
        `/api/v1/pairs/${id}/latest/`,
        fetcher,
        { refreshInterval: 30000 }
    )

    const { data: historyData, isLoading: loadingHistory } = useSWR<PairHistory>(
        `/api/v1/pairs/${id}/history/?period=${period}`,
        fetcher
    )

    const { data: portfolio } = useSWR<Portfolio>("/api/v1/portfolio/", fetcher)

    const pair = latestData?.pair

    const pairTrades = useMemo(() => {
        return (tradesData?.trades ?? []).filter((t) => t.pair === pair?.pair)
    }, [tradesData, pair])

    const buyCount = pairTrades.filter((t) => t.side === "buy").length
    const sellCount = pairTrades.filter((t) => t.side === "sell").length
    const totalVolume = pairTrades.reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const history = historyData?.history ?? []
    const chartData = history.map((h) => [
        new Date(h.recorded_at).getTime(),
        parseFloat(h.rate),
    ])

    const todayHigh = chartData.length ? Math.max(...chartData.map((d) => d[1])) : 0
    const todayLow = chartData.length ? Math.min(...chartData.map((d) => d[1])) : 0
    const isPositive = pair ? parseFloat(pair.change_pct) >= 0 : true

    const chartOptions: Highcharts.Options = {
        chart: {
            type: "spline",
            backgroundColor: "white",
            height: 300,
            style: { fontFamily: "inherit" },
        },
        title: { text: undefined },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
            type: "datetime",
            lineColor: "#e5e7eb",
            tickColor: "#e5e7eb",
            labels: { style: { color: "#6b7280", fontSize: "11px" } },
        },
        yAxis: {
            title: { text: null },
            gridLineColor: "#f3f4f6",
            labels: { style: { color: "#6b7280", fontSize: "11px" } },
        },
        tooltip: {
            xDateFormat: "%d %b %Y %H:%M",
            valueDecimals: 4,
            backgroundColor: "#1f2937",
            style: { color: "white" },
            borderWidth: 0,
            borderRadius: 8,
        },
        series: [
            {
                type: "spline",
                name: pair?.pair ?? "Rate",
                data: chartData,
                color: "#0f766e",
                lineWidth: 2,
                marker: { enabled: false },
            },
        ],
    }

    if (loadingPair) {
        return (
            <FlexLayout justify="center" style={{ padding: 80 }}>
                <Spinner />
            </FlexLayout>
        )
    }

    if (!pair) {
        return (
            <Card style={{ padding: 24 }}>
                <Text>Pair not found.</Text>
                <Button onClick={() => navigate("/customer/pairs")}>← Back</Button>
            </Card>
        )
    }

    return (
        <StackLayout gap={3}>

            <FlexLayout justify="space-between" align="center">
                <FlexLayout align="center" gap={2}>
                    <Button appearance="transparent" onClick={() => navigate("/customer/pairs")}
                        style={{ color: "#374151", fontWeight: 600 }}>
                        Back
                    </Button>
                    <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                        Last updated: {new Date().toLocaleTimeString("en-GB")}
                    </Text>
                </FlexLayout>
                <FlexLayout gap={1}>
                    <Button appearance="solid" style={{ background: "#0f766e", color: "white", fontWeight: 600 }}
                        onClick={() => setShowMarket(true)}>
                        Market Exchange
                    </Button>
                    <Button appearance="bordered" style={{ borderColor: "#0f766e", color: "#0f766e", fontWeight: 600 }}
                        onClick={() => setShowLimit(true)}>
                        Place Limit Order
                    </Button>
                </FlexLayout>
            </FlexLayout>

            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <FlexLayout justify="space-between" align="flex-start" wrap>
                    <StackLayout gap={0.5}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Current Rate</Text>
                        <Text style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>
                            {parseFloat(pair.rate).toFixed(4)}
                        </Text>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
                            1 {pair.base.code} = {parseFloat(pair.rate).toFixed(4)} {pair.quote.code}
                        </Text>
                    </StackLayout>

                    <FlexLayout gap={4}>
                        <StackLayout gap={0}>
                            <FlexLayout align="center" gap={0.5}>
                                <Text style={{ color: "#059669", fontSize: 13 }}>↗</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Today High</Text>
                            </FlexLayout>
                            <Text style={{ fontWeight: 700, fontSize: 20 }}>{todayHigh.toFixed(4)}</Text>
                        </StackLayout>
                        <StackLayout gap={0}>
                            <FlexLayout align="center" gap={0.5}>
                                <Text style={{ color: "#dc2626", fontSize: 13 }}>↘</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Today Low</Text>
                            </FlexLayout>
                            <Text style={{ fontWeight: 700, fontSize: 20 }}>{todayLow.toFixed(4)}</Text>
                        </StackLayout>
                    </FlexLayout>
                </FlexLayout>
            </Card>

            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <FlexLayout justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: 700, fontSize: 18 }}>Rate History</Text>
                    <FlexLayout gap={1}>
                        {(["1h", "1d", "1w", "1m"] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                    background: period === p ? "#111827" : "#f9fafb",
                                    color: period === p ? "white" : "#374151",
                                    fontWeight: period === p ? 700 : 500,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </FlexLayout>
                </FlexLayout>

                {loadingHistory ? (
                    <FlexLayout justify="center" style={{ padding: 40 }}>
                        <Spinner />
                    </FlexLayout>
                ) : history.length === 0 ? (
                    <FlexLayout justify="center" style={{ padding: 40 }}>
                        <Text style={{ color: "#9ca3af" }}>No history data available</Text>
                    </FlexLayout>
                ) : (
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                )}
            </Card>

            {/* Market activity */}
            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <Text style={{ fontWeight: 700, fontSize: 18 }}>Market Activity</Text>
                <Text styleAs="label" style={{ color: "#f59e0b", fontSize: 12, marginBottom: 20, display: "block" }}>
                    ^ Buy/Sell counts are based on your personal trade history.
                </Text>
                <FlexLayout gap={6}>
                    <StackLayout gap={0}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Buy Count</Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: "#059669" }}>{buyCount}</Text>
                    </StackLayout>
                    <StackLayout gap={0}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Sell Count</Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>{sellCount}</Text>
                    </StackLayout>
                    <StackLayout gap={0}>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Total Volume</Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                            {totalVolume.toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                        </Text>
                    </StackLayout>
                </FlexLayout>
            </Card>

            {/* Recent trades */}
            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <Text style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Trades</Text>
                {pairTrades.length === 0 ? (
                    <Text style={{ color: "#9ca3af", fontSize: 13 }}>No trades yet for this pair.</Text>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                {["ID", "Type", "Amount", "Rate", "Total", "Timestamp"].map((h) => (
                                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pairTrades.slice(0, 10).map((t) => (
                                <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{t.id}</td>
                                    <td style={{ padding: "10px 12px", fontWeight: 600, color: t.side === "buy" ? "#059669" : "#dc2626" }}>
                                        {t.side}
                                    </td>
                                    <td style={{ padding: "10px 12px" }}>{parseFloat(t.amount).toLocaleString("en-GB")}</td>
                                    <td style={{ padding: "10px 12px" }}>{parseFloat(t.rate).toFixed(4)}</td>
                                    <td style={{ padding: "10px 12px" }}>{parseFloat(t.total).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                                        {new Date(t.executed_at).toLocaleString("en-GB")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/*  Disclaimer*/}
            <div style={{ padding: "14px 18px", background: "#fefce8", borderRadius: 10, border: "1px solid #fef08a" }}>
                <Text style={{ fontSize: 13, color: "#854d0e" }}>
                    <strong>Disclaimer:</strong> This is a reference-only platform. Not financial advice. Bank fees may apply for real transactions. All trades are simulated within this platform.
                </Text>
            </div>

            {showMarket && (
                <MarketExchangeModal pair={pair} portfolio={portfolio} onClose={() => setShowMarket(false)} />
            )}
            {showLimit && (
                <LimitOrderModal pair={pair} portfolio={portfolio} onClose={() => setShowLimit(false)} />
            )}
        </StackLayout>
    )
}