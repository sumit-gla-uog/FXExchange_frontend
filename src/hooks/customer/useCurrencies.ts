import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

const getRateInfo = (code: string, snapshot: FX.Shared.MarketSnapshot | undefined) => {
  if (!snapshot) return null
  const match = snapshot.market_snapshot.find((p) => p.pair === `GBP/${code}`)
  return match ? { rate: match.rate, change_pct: match.change_pct } : null
}

export const useCurrencies = (search: string) => {
  const { data: currenciesData, isLoading } = useSWR<FX.Shared.CurrenciesResponse>(
    `/api/v1/currencies/${search ? `?search=${search}` : ""}`, fetcher
  )
  const { data: snapshot } = useSWR<FX.Shared.MarketSnapshot>(
    "/api/v1/dashboard/market-snapshot/", fetcher
  )

  const currencies = currenciesData?.currencies ?? []

  return { currencies, snapshot, isLoading, getRateInfo }
}