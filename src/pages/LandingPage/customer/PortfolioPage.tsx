import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Button,
  Spinner,
} from "@salt-ds/core";
import { fetcher } from "../../../api/swr";


interface Holding {
  currency: {
    code: string;
    name: string;
    symbol: string;
    flag: string;
  };
  amount: string;
  avg_buy_rate: string;
  gbp_value: string | null;
}

interface Portfolio {
  holdings: Holding[];
  total_value_gbp: string;
}

interface MarketPair {
  pair: string;
  rate: string;
  change_pct: string;
}

interface MarketSnapshot {
  market_snapshot: MarketPair[];
}

// I will move this helper method to utils later: get change_pct for a currency from market snapshot

const getChangePct = (
  code: string,
  snapshot: MarketSnapshot | undefined
): string | null => {
  if (!snapshot) return null;
  const match = snapshot.market_snapshot.find((p) =>
    p.pair.startsWith(code + "/") || p.pair.endsWith("/" + code)
  );
  return match?.change_pct ?? null;
};


export const PortfolioPage = () => {
  const navigate = useNavigate();

  const { data: portfolio, isLoading } = useSWR<Portfolio>(
    "/api/v1/portfolio/",
    fetcher
  );

  const { data: snapshot } = useSWR<MarketSnapshot>(
    "/api/v1/dashboard/market-snapshot/",
    fetcher
  );

  const totalValue = parseFloat(portfolio?.total_value_gbp ?? "0");
  const totalHoldings = portfolio?.holdings.length ?? 0;

  return (
    <StackLayout gap={3}>
      {/* Portfolio Summary */}
      <Card
        style={{
          padding: "24px 28px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <Text style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
          Portfolio Summary
        </Text>

        <FlexLayout gap={6} wrap>
          {/* Total Value */}
          <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
              Total Value
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
              {isLoading
                ? "..."
                : totalValue.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
            </Text>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
              GBP
            </Text>
          </StackLayout>

          <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />

          {/* Total Holdings */}
          <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
              Total Holdings
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
              {isLoading ? "..." : totalHoldings}
            </Text>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
              Currencies
            </Text>
          </StackLayout>

          <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />

          {/* Base Currency */}
          <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
              Base Currency
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
              GBP
            </Text>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
              Primary
            </Text>
          </StackLayout>
        </FlexLayout>
      </Card>

      {/* my holdings table*/}
      <Card
        style={{
          padding: "24px 28px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <Text style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
          Your Holdings
        </Text>

        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 40 }}>
            <Spinner />
          </FlexLayout>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              {/* Header */}
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {["Currency", "Amount", "Value in GBP", "24h Change", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: "12px 16px",
                          textAlign: col === "Currency" ? "left" : "right",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {(portfolio?.holdings ?? []).map((h) => {
                  const changePct = getChangePct(h.currency.code, snapshot);
                  const pct = changePct ? parseFloat(changePct) : null;
                  const isPositive = pct !== null && pct >= 0;

                  return (
                    <tr
                      key={h.currency.code}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Currency */}
                      <td style={{ padding: "16px" }}>
                        <FlexLayout align="center" gap={1.5}>
                          <span style={{ fontSize: 24 }}>{h.currency.flag}</span>
                          <StackLayout gap={0}>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>
                              {h.currency.code}
                            </Text>
                            <Text
                              styleAs="label"
                              style={{ color: "#6b7280", fontSize: 12 }}
                            >
                              {h.currency.name}
                            </Text>
                          </StackLayout>
                        </FlexLayout>
                      </td>

                      {/* Amount */}
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {parseFloat(h.amount).toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* GBP Value */}
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {h.gbp_value
                          ? parseFloat(h.gbp_value).toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })
                          : "0.00"}
                      </td>

                      {/* 24h Change */}
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "right",
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            pct === null
                              ? "#9ca3af"
                              : isPositive
                              ? "#059669"
                              : "#dc2626",
                        }}
                      >
                        {pct === null
                          ? "—"
                          : `${isPositive ? "↗ +" : "↘ "}${pct.toFixed(2)}%`}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <Button
                          appearance="solid"
                          sentiment="accented"
                          style={{
                            background: "#0f766e",
                            color: "white",
                            borderRadius: 8,
                            fontSize: 13,
                            padding: "6px 16px",
                          }}
                          onClick={() => navigate("/customer/pairs")}
                        >
                          Trade
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </StackLayout>
  )
}