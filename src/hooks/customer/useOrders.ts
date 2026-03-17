import { useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

export const useOrders = (activeTab: FX.Customer.TabStatus) => {
  const { data: allOrdersData, isLoading: ordersLoading } =
    useSWR<FX.Customer.OrdersResponse>("/api/v1/orders/", fetcher)

  const { data: tradesData, isLoading: tradesLoading } =
    useSWR<FX.Customer.TradesResponse>("/api/v1/trades/", fetcher)

  const isLoading = !allOrdersData || !tradesData

  const { counts, activeOrders } = useMemo(() => {
    const allOrders = allOrdersData?.orders ?? []
    const allTrades = tradesData?.trades ?? []

    const normalizedTrades = allTrades.map(t => ({
      id: `m-${t.id}`, pair: t.pair, side: t.side, amount: t.amount,
      limit_rate: t.rate, status: "filled" as const,
      created_at: t.executed_at, updated_at: t.executed_at,
      type: "market", total: t.total,
    }))

    const normalizedOrders = allOrders.map(o => ({
      ...o, type: "limit",
      total: (parseFloat(o.amount) * parseFloat(o.limit_rate)).toFixed(2),
    }))

    const counts = {
      all:       normalizedTrades.length + normalizedOrders.length,
      open:      normalizedOrders.filter(o => o.status === "open").length,
      filled:    normalizedOrders.filter(o => o.status === "filled").length + normalizedTrades.length,
      cancelled: normalizedOrders.filter(o => o.status === "cancelled").length,
    }

    let activeOrders
    switch (activeTab) {
      case "open":      activeOrders = normalizedOrders.filter(o => o.status === "open"); break
      case "filled":    activeOrders = [...normalizedTrades, ...normalizedOrders.filter(o => o.status === "filled")]; break
      case "cancelled": activeOrders = normalizedOrders.filter(o => o.status === "cancelled"); break
      default:          activeOrders = [...normalizedTrades, ...normalizedOrders]
    }

    return { counts, activeOrders }
  }, [allOrdersData, tradesData, activeTab])

  return { counts, activeOrders, isLoading }
}