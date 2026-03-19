import { useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "../../api/swr"
import { apiFetch } from "../../api/client"
import type { FX } from "../../types/FX"

export const useHistory = (search: string) => {
  const { data: tradesData, isLoading: tradesLoading } =
    useSWR<FX.Customer.TradesResponse>("/api/v1/trades/", fetcher)

  const { data: allOrdersData, isLoading: ordersLoading } =
    useSWR<FX.Customer.OrdersResponse>("/api/v1/orders/", fetcher)

  const isLoading = tradesLoading || ordersLoading

  const { stats, filteredRows } = useMemo(() => {
    const trades = tradesData?.trades ?? []
    const orders = allOrdersData?.orders ?? []

    const normalizedTrades = trades.map((t) => ({
      id: `m-${t.id}`, date: t.executed_at, pair: t.pair, side: t.side,
      amount: parseFloat(t.amount), rate: parseFloat(t.rate), total: parseFloat(t.total),
      type: "Market", status: "Executed",
    }))

    const normalizedOrders = orders.map((o) => ({
      id: `l-${o.id}`, date: o.updated_at, pair: o.pair, side: o.side,
      amount: parseFloat(o.amount), rate: parseFloat(o.limit_rate),
      total: parseFloat(o.amount) * parseFloat(o.limit_rate),
      type: "Limit", status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
    }))

    const allRows = [...normalizedTrades, ...normalizedOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const totalVolumeGBP = normalizedTrades.reduce((sum, t) => sum + t.amount, 0)

    const pairCount: Record<string, number> = {}
    allRows.forEach((r) => { pairCount[r.pair] = (pairCount[r.pair] ?? 0) + 1 })
    const mostTraded = Object.entries(pairCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

    const filteredRows = search
      ? allRows.filter((r) => r.pair.toLowerCase().includes(search.toLowerCase()))
      : allRows

    return {
      stats: {
        totalTrades: allRows.length,
        marketCount: normalizedTrades.length,
        limitCount: normalizedOrders.length,
        totalVolumeGBP,
        mostTraded,
      },
      filteredRows,
    }
  }, [tradesData, allOrdersData, search])

  const handleExport = async () => {
    try {
      const blob = await apiFetch<Blob>("/api/v1/trades/export/", { auth: true })
      const url = URL.createObjectURL(new Blob([blob as any]))
      const a = document.createElement("a")
      a.href = url; a.download = "trades.csv"; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error("Export failed", e) }
  }

  return { stats, filteredRows, isLoading, handleExport }
}