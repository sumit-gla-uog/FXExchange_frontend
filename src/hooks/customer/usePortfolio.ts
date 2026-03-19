import { useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

const getChangePct = (code: string, snapshot: FX.Shared.MarketSnapshot | undefined): number | null => {
  if (!snapshot) return null
  const match = snapshot.market_snapshot.find(
    (p) => p.pair.startsWith(code + "/") || p.pair.endsWith("/" + code)
  )
  return match ? parseFloat(match.change_pct) : null
}

export const usePortfolio = () => {
  const { data: portfolio, isLoading } =
    useSWR<FX.Customer.Portfolio>("/api/v1/portfolio/", fetcher)

  const { data: snapshot } =
    useSWR<FX.Shared.MarketSnapshot>("/api/v1/dashboard/market-snapshot/", fetcher)

  const totalValue = parseFloat(portfolio?.total_value_gbp ?? "0")
  const totalHoldings = portfolio?.holdings.length ?? 0

  const rowData = useMemo(() =>
    (portfolio?.holdings ?? []).map((h) => ({
      ...h,
      amount_num: parseFloat(h.amount),
      gbp_value_num: h.gbp_value ? parseFloat(h.gbp_value) : 0,
      change_pct: getChangePct(h.currency.code, snapshot),
    })),
    [portfolio, snapshot]
  )

  return { portfolio, snapshot, rowData, totalValue, totalHoldings, isLoading }
}