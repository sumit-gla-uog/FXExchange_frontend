import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Input,
  Spinner,
} from "@salt-ds/core";
import { fetcher } from "../../../api/swr";


interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  flag: string;
  enabled: boolean;
}

interface CurrenciesResponse {
  currencies: Currency[];
}

interface MarketPair {
  pair: string;
  rate: string;
  change_pct: string;
}

interface MarketSnapshot {
  market_snapshot: MarketPair[];
}

// move this helper method into Utils

const getRateInfo = (
  code: string,
  snapshot: MarketSnapshot | undefined
): { rate: string; change_pct: string } | null => {
  if (!snapshot) return null;
  // find GBP/CODE pair
  const match = snapshot.market_snapshot.find(
    (p) => p.pair === `GBP/${code}`
  );
  return match ? { rate: match.rate, change_pct: match.change_pct } : null;
};

// Currency Card , Duplicate, later move this common component into UI folder

const CurrencyCard = ({
  currency,
  rateInfo,
}: {
  currency: Currency;
  rateInfo: { rate: string; change_pct: string } | null;
}) => {
  const isBase = currency.code === "GBP";
  const pct = rateInfo ? parseFloat(rateInfo.change_pct) : null;
  const isPositive = pct !== null && pct >= 0;

  return (
    <Card
      style={{
        padding: "28px 20px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
        textAlign: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "default",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.06)")
      }
    >
     
      <div style={{ fontSize: 40 }}>{currency.flag}</div>

      {/* Currency code + Name */}
      <StackLayout gap={0} style={{ alignItems: "center" }}>
        <Text style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>
          {currency.code}
        </Text>
        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
          {currency.name}
        </Text>
      </StackLayout>

      {/* Rate info or Base Currency badge */}
      {isBase ? (
        <Text
          style={{
            color: "#0f766e",
            fontWeight: 600,
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Base Currency
        </Text>
      ) : rateInfo ? (
        <StackLayout gap={0} style={{ alignItems: "center", marginTop: 4 }}>
          <Text style={{ fontSize: 13, color: "#374151" }}>
            Rate: {parseFloat(rateInfo.rate).toFixed(4)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: isPositive ? "#059669" : "#dc2626",
            }}
          >
            {/* I will update these arrows with salt icons */}
            {isPositive ? "↗" : "↘"} {isPositive ? "" : ""} 
            {pct !== null
              ? `${isPositive ? "" : ""}${pct.toFixed(2)}%`
              : "—"}
          </Text>
        </StackLayout>
      ) : (
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          No rate available
        </Text>
      )}
    </Card>
  )
}


export const CurrenciesPage = () => {
  const [search, setSearch] = useState("");

  const { data: currenciesData, isLoading } = useSWR<CurrenciesResponse>(
    `/api/v1/currencies/${search ? `?search=${search}` : ""}`,
    fetcher
  );

  const { data: snapshot } = useSWR<MarketSnapshot>(
    "/api/v1/dashboard/market-snapshot/",
    fetcher
  );

  const currencies = currenciesData?.currencies ?? [];

  return (
    <StackLayout gap={3}>
      {/* Curency search bar */}
      <div
        style={{
          background: "#0f766e",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 4,
        }}
      >
        {/* I will implement debouncer later to limit api call on each key press */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type your currency"
          style={{
            width: "100%",
            borderRadius: 8,
            fontSize: 15,
            background: "white",
          }}
          startAdornment={
            <span style={{ color: "#6b7280", paddingLeft: 4 }}></span>
          }
        />
      </div>

    
      <FlexLayout justify="space-between" align="center">
        <StackLayout gap={0}>
          <Text style={{ fontWeight: 700, fontSize: 20 }}>All Currencies</Text>
          <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
            {isLoading
              ? "Loading..."
              : `Showing ${currencies.length} ${currencies.length === 1 ? "currency" : "currencies"}`}
          </Text>
        </StackLayout>
      </FlexLayout>


      {isLoading ? (
        <FlexLayout justify="center" style={{ padding: 60 }}>
          <Spinner />
        </FlexLayout>
      ) : currencies.length === 0 ? (
        <Card
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#6b7280" }}>
            No currencies found for "{search}"
          </Text>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {currencies.map((c) => (
            <CurrencyCard
              key={c.id}
              currency={c}
              rateInfo={getRateInfo(c.code, snapshot)}
            />
          ))}
        </div>
      )}
    </StackLayout>
  )
}