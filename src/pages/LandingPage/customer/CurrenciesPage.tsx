import { useState } from "react"
import useSWR from "swr"
import { FlexLayout, StackLayout, Text, Spinner, Card } from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { CurrencyCard } from "../../../components/Ui/CurrencyCard"
import { CurrencySearchBar } from "../../../components/Ui/CurrencySearchBar"
import type { FX } from "../../../types/FX"


// TODO: move to utils/
const getRateInfo = (code: string, snapshot: FX.Shared.MarketSnapshot | undefined) => {
  if (!snapshot) return null;
  const match = snapshot.market_snapshot.find((p) => p.pair === `GBP/${code}`);
  return match ? { rate: match.rate, change_pct: match.change_pct } : null;
}

export const CurrenciesPage = () => {
  const [search, setSearch] = useState("");

  const { data: currenciesData, isLoading } = useSWR<FX.Shared.CurrenciesResponse>(
    `/api/v1/currencies/${search ? `?search=${search}` : ""}`, fetcher
  );
  const { data: snapshot } = useSWR<FX.Shared.MarketSnapshot>(
    "/api/v1/dashboard/market-snapshot/", fetcher
  );

  const currencies = currenciesData?.currencies ?? [];

  return (
    <StackLayout gap={0}>
      {/* Full search bar flush at top of page content */}
      <div style={{ margin: "-24px -24px 0", overflow: "hidden" }}>
        <CurrencySearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search currencies..."
          subtitle={
            !isLoading
              ? `Showing ${currencies.length} ${currencies.length === 1 ? "currency" : "currencies"}`
              : undefined
          }
        />
      </div>

      <div style={{ padding: "24px 0 16px" }}>
        <StackLayout gap={0}>
          <Text style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>All Currencies</Text>
          <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
            {isLoading ? "Loading..." : `Showing ${currencies.length} ${currencies.length === 1 ? "currency" : "currencies"}`}
          </Text>
        </StackLayout>
      </div>

      {isLoading ? (
        <FlexLayout justify="center" style={{ padding: 60 }}><Spinner /></FlexLayout>
      ) : currencies.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <Text style={{ color: "#9ca3af" }}>No currencies found for "{search}"</Text>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14 }}>
          {currencies.map((c) => {
            const rateInfo = getRateInfo(c.code, snapshot);
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