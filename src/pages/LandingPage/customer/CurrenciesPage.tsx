import { useState } from "react"
import useSWR from "swr"
import { FlexLayout, StackLayout, Text, Spinner, Card } from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { CurrencyCard } from "../../../components/ui/CurrencyCard"
import { CurrencySearchBar } from "../../../components/ui/CurrencySearchBar"
import type { FX } from "../../../types/FX"
import "./CurrenciesPage.css"

const getRateInfo = (code: string, snapshot: FX.Shared.MarketSnapshot | undefined) => {
  if (!snapshot) return null
  const match = snapshot.market_snapshot.find((p) => p.pair === `GBP/${code}`)
  return match ? { rate: match.rate, change_pct: match.change_pct } : null
}

export const CurrenciesPage = () => {
  const [search, setSearch] = useState("")

  const { data: currenciesData, isLoading } = useSWR<FX.Shared.CurrenciesResponse>(
    `/api/v1/currencies/${search ? `?search=${search}` : ""}`, fetcher
  )
  const { data: snapshot } = useSWR<FX.Shared.MarketSnapshot>(
    "/api/v1/dashboard/market-snapshot/", fetcher
  )

  const currencies = currenciesData?.currencies ?? []

  return (
    <StackLayout gap={0}>
      <div className="currencies-search-wrapper">
        <CurrencySearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search currencies..."
          subtitle={!isLoading ? `Showing ${currencies.length} ${currencies.length === 1 ? "currency" : "currencies"}` : undefined}
        />
      </div>

      <div className="currencies-header">
        <StackLayout gap={0}>
          <Text className="currencies-title">All Currencies</Text>
          <Text className="currencies-count">
            {isLoading ? "Loading..." : `Showing ${currencies.length} ${currencies.length === 1 ? "currency" : "currencies"}`}
          </Text>
        </StackLayout>
      </div>

      {isLoading ? (
        <div className="currencies-spinner"><Spinner /></div>
      ) : currencies.length === 0 ? (
        <Card className="currencies-empty">
          <Text className="currencies-empty-text">No currencies found for "{search}"</Text>
        </Card>
      ) : (
        <div className="currencies-grid">
          {currencies.map((c) => {
            const rateInfo = getRateInfo(c.code, snapshot)
            return (
              <CurrencyCard
                key={c.id}
                variant="full"
                data={{
                  code: c.code,
                  name: c.name,
                  flag: c.flag,
                  rate: rateInfo ? parseFloat(rateInfo.rate) : null,
                  changePct: rateInfo ? parseFloat(rateInfo.change_pct) : null,
                  isBase: c.code === "GBP",
                }}
              />
            )
          })}
        </div>
      )}
    </StackLayout>
  )
}