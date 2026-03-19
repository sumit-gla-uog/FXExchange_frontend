import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

export const useDashboard = () => {
  const { data: summary, isLoading: loadingSummary, error: summaryError } =
    useSWR<FX.Customer.DashboardSummary>("/api/v1/dashboard/summary/", fetcher)

  const { data: snapshot, isLoading: loadingSnapshot } =
    useSWR<FX.Customer.DashboardMarketSnapshot>("/api/v1/dashboard/market-snapshot/", fetcher)

  const { data: portfolio } =
    useSWR<FX.Customer.Portfolio>("/api/v1/portfolio/", fetcher)

  const { data: ordersData } =
    useSWR<FX.Customer.OrdersResponse>("/api/v1/orders/?status=open", fetcher)

  const gbpHolding = portfolio?.holdings.find((h) => h.currency.code === "GBP")
  const openOrders = ordersData?.orders?.length ?? 0
  const isApiOnline = !summaryError

  return {
    summary,
    snapshot,
    portfolio,
    gbpHolding,
    openOrders,
    isApiOnline,
    loadingSummary,
    loadingSnapshot,
  }
}