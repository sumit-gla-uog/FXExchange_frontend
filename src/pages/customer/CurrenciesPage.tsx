import { useState } from "react"
import { StackLayout, Text, Spinner, Card } from "@salt-ds/core"
import { CurrencyCard } from "../../components/ui/CurrencyCard"
import { CurrencySearchBar } from "../../components/ui/CurrencySearchBar"
import { useCurrencies } from "../../hooks/customer/useCurrencies"
import "./CurrenciesPage.css"

export const CurrenciesPage = () => {
  const [search, setSearch] = useState("")
  const { currencies, snapshot, isLoading, getRateInfo } = useCurrencies(search)

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
        <StackLayout gap={1}>
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
                  code: c.code, name: c.name, flag: c.flag,
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