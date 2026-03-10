import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Input,
  Button,
  Spinner,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
} from "@salt-ds/core";
import { fetcher } from "../../../api/swr";
import { apiFetch } from "../../../api/client";

interface Pair {
  id: number;
  pair: string;
  base: { code: string; name: string; symbol: string; flag: string };
  quote: { code: string; name: string; symbol: string; flag: string };
  rate: string;
  change_pct: string;
}

interface PairsResponse {
  pairs: Pair[];
}

const calcSpread = (rate: string): string => {
  const r = parseFloat(rate);
  return (r * 0.0003).toFixed(4);
}

const TradeModal = ({
  pair,
  onClose,
}: {
  pair: Pair;
  onClose: () => void;
}) => {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rate = parseFloat(pair.rate);
  const parsedAmount = parseFloat(amount) || 0;
  const total = (parsedAmount * rate).toFixed(2);

  const handleTrade = async () => {
    if (!amount || parsedAmount <= 0) {
      setError("Valid amount daalo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/v1/trades/market/", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ pair_id: pair.id, side, amount }),
      });
      setSuccess(`${side === "buy" ? "Bought" : "Sold"} ${amount} ${pair.base.code} successfully!`);
      // Refrsh portfolio + dashboard
      mutate("/api/v1/portfolio/");
      mutate("/api/v1/dashboard/summary/");
      mutate("/api/v1/trades/");
    } catch (e: any) {
      setError(e.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(_, open) => !open && onClose()} size="sm">
      <DialogHeader header={`Trade ${pair.pair}`} />
      <DialogContent>
        <StackLayout gap={2}>
          {/* Pair info */}
          <div
            style={{
              background: "#f0fdf9",
              borderRadius: 8,
              padding: "12px 16px",
              border: "1px solid #ccfbf1",
            }}
          >
            <FlexLayout justify="space-between">
              <Text style={{ fontSize: 13, color: "#6b7280" }}>Current Rate</Text>
              <Text style={{ fontWeight: 700, color: "#0f766e" }}>
                {parseFloat(pair.rate).toFixed(4)}
              </Text>
            </FlexLayout>
          </div>

          <FlexLayout gap={1}>
            <button
              onClick={() => setSide("buy")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: side === "buy" ? "#0f766e" : "#f3f4f6",
                color: side === "buy" ? "white" : "#374151",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Buy {pair.base.code}
            </button>
            <button
              onClick={() => setSide("sell")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: side === "sell" ? "#dc2626" : "#f3f4f6",
                color: side === "sell" ? "white" : "#374151",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sell {pair.base.code}
            </button>
          </FlexLayout>

          <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ fontSize: 13, color: "#374151" }}>
              Amount ({pair.base.code})
            </Text>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`e.g. 100`}
              type="number"
              style={{ width: "100%" }}
            />
          </StackLayout>

          {parsedAmount > 0 && (
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 8,
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
              }}
            >
              <FlexLayout justify="space-between">
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  You {side === "buy" ? "spend" : "receive"}
                </Text>
                <Text style={{ fontWeight: 600 }}>
                  {total} {pair.quote.code}
                </Text>
              </FlexLayout>
            </div>
          )}

          {error && (
            <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>
          )}
          {success && (
            <Text style={{ color: "#059669", fontSize: 13 }}>{success}</Text>
          )}
        </StackLayout>
      </DialogContent>
      <DialogActions>
        <Button appearance="bordered" onClick={onClose}>
          Cancel
        </Button>
        <Button
          appearance="solid"
          sentiment="accented"
          onClick={handleTrade}
          disabled={loading || !!success}
          style={{ background: side === "buy" ? "#0f766e" : "#dc2626", color: "white" }}
        >
          {loading ? "Processing..." : `Confirm ${side === "buy" ? "Buy" : "Sell"}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


export const PairsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);

  const { data, isLoading } = useSWR<PairsResponse>(
    `/api/v1/pairs/${search ? `?search=${search}` : ""}`,
    fetcher
  )

  const pairs = data?.pairs ?? [];

  return (
    <StackLayout gap={3}>
      {/* Search Barfor pairs, I'll make this search bar common component and update it with debouncing later*/}
      <div
        style={{
          background: "#0f766e",
          borderRadius: 12,
          padding: "16px 20px",
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pairs (e.g., GBP/USD)..."
          style={{ width: "100%", borderRadius: 8, background: "white" }}
          startAdornment={
            <span style={{ color: "#6b7280", paddingLeft: 4 }}></span>
          }
        />
      </div>

      <Text style={{ color: "#6b7280", fontSize: 14 }}>
        Showing <strong>{pairs.length}</strong> trading pairs
      </Text>

      <Card
        style={{
          padding: 0,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 60 }}>
            <Spinner />
          </FlexLayout>
        ) : pairs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No pairs found for "{search}"</Text>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            {/* Header */}
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Pair", "Current Rate", "24h Change", "Spread", "Action"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: "14px 20px",
                        textAlign: col === "Pair" ? "left" : "right",
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
              {pairs.map((p) => {
                const pct = parseFloat(p.change_pct);
                const isPositive = pct >= 0;

                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Pair */}
                    <td style={{ padding: "16px 20px" }}>
                      <FlexLayout align="center" gap={1.5}>
                        <span style={{ fontSize: 22 }}>{p.quote.flag}</span>
                        <StackLayout gap={0}>
                          <Text style={{ fontWeight: 700, fontSize: 15 }}>
                            {p.pair}
                          </Text>
                          <Text
                            styleAs="label"
                            style={{ color: "#6b7280", fontSize: 12 }}
                          >
                            {p.quote.name}
                          </Text>
                        </StackLayout>
                      </FlexLayout>
                    </td>

                    {/* Rate */}
                    <td
                      style={{
                        padding: "16px 20px",
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: 15,
                      }}
                    >
                      {parseFloat(p.rate).toFixed(4)}
                    </td>

                    {/* 24h Change */}
                    <td
                      style={{
                        padding: "16px 20px",
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: 14,
                        color: isPositive ? "#059669" : "#dc2626",
                      }}
                    >
                      {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}
                      {pct.toFixed(2)}%
                    </td>

                    {/* Spread */}
                    <td
                      style={{
                        padding: "16px 20px",
                        textAlign: "right",
                        fontSize: 14,
                        color: "#374151",
                      }}
                    >
                      {calcSpread(p.rate)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <Button
                        appearance="solid"
                        sentiment="accented"
                        style={{
                          background: "#0f766e",
                          color: "white",
                          borderRadius: 8,
                          padding: "6px 20px",
                          fontWeight: 600,
                        }}
                        onClick={() => setSelectedPair(p)}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

     
      {selectedPair && (
        <TradeModal
          pair={selectedPair}
          onClose={() => setSelectedPair(null)}
        />
      )}
    </StackLayout>
  )
}