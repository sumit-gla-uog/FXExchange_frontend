import { useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

interface PairLatest   { pair: FX.Customer.Pair }
interface HistoryPoint { rate: string; recorded_at: string }
interface PairHistory  { pair: string; period: string; history: HistoryPoint[] }
interface Portfolio {
  holdings: { currency: { code: string }; amount: string; gbp_value: string | null }[]
  total_value_gbp: string
}

export type { PairLatest, HistoryPoint, PairHistory, Portfolio as PairDetailPortfolio }

export const usePairDetail = (id: string | undefined, period: string) => {
  const { data: tradesData } =
    useSWR<{ trades: any[] }>("/api/v1/trades/", fetcher)

  const { data: latestData, isLoading: loadingPair } =
    useSWR<PairLatest>(`/api/v1/pairs/${id}/latest/`, fetcher, { refreshInterval: 30000 })

  const { data: historyData, isLoading: loadingHistory } =
    useSWR<PairHistory>(`/api/v1/pairs/${id}/history/?period=${period}`, fetcher)

  const { data: portfolio } =
    useSWR<Portfolio>("/api/v1/portfolio/", fetcher)

  const pair = latestData?.pair

  const pairTrades = useMemo(() =>
    (tradesData?.trades ?? []).filter((t) => t.pair === pair?.pair),
    [tradesData, pair]
  )

  const buyCount    = pairTrades.filter((t) => t.side === "buy").length
  const sellCount   = pairTrades.filter((t) => t.side === "sell").length
  const totalVolume = pairTrades.reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const history   = historyData?.history ?? []
  const chartData = history.map((h) => [new Date(h.recorded_at).getTime(), parseFloat(h.rate)])
  const todayHigh = chartData.length ? Math.max(...chartData.map((d) => d[1])) : 0
  const todayLow  = chartData.length ? Math.min(...chartData.map((d) => d[1])) : 0

  return {
    pair, portfolio, pairTrades,
    buyCount, sellCount, totalVolume,
    history, chartData, todayHigh, todayLow,
    loadingPair, loadingHistory,
  }
}