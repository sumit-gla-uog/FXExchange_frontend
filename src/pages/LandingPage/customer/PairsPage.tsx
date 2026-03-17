import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
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
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"
import { useNavigate } from "react-router-dom"
import { CurrencySearchBar } from "../../../components/ui/CurrencySearchBar"
import type { FX } from "../../../types/FX"

ModuleRegistry.registerModules([AllCommunityModule])

const calcSpread = (rate: string) => (parseFloat(rate) * 0.0003).toFixed(4)

const TradeModal = ({ pair, onClose }: { pair: FX.Customer.Pair; onClose: () => void }) => {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const rate = parseFloat(pair.rate)
  const parsedAmount = parseFloat(amount) || 0
  const total = (parsedAmount * rate).toFixed(2)

  const handleTrade = async () => {
    if (!amount || parsedAmount <= 0) { setError("Please enter a valid amount"); return; }
    setLoading(true); setError("")
    try {
      await apiFetch("/api/v1/trades/market/", {
        method: "POST", auth: true,
        body: JSON.stringify({ pair_id: pair.id, side, amount }),
      });
      setSuccess(`${side === "buy" ? "Bought" : "Sold"} ${amount} ${pair.base.code} successfully!`);
      mutate("/api/v1/portfolio/");
      mutate("/api/v1/dashboard/summary/");
      mutate("/api/v1/trades/");
    } catch (e: any) {
      setError(e.message || "Trade failed");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
      <DialogHeader header={`Trade ${pair.pair}`} />
      <DialogContent>
        <StackLayout gap={2}>
          <div style={{ background: "#f0fdf9", borderRadius: 8, padding: "12px 16px", border: "1px solid #ccfbf1" }}>
            <FlexLayout justify="space-between">
              <Text style={{ fontSize: 13, color: "#6b7280" }}>Current Rate</Text>
              <Text style={{ fontWeight: 700, color: "#0f766e" }}>{parseFloat(pair.rate).toFixed(4)}</Text>
            </FlexLayout>
          </div>
          <FlexLayout gap={1}>
            <button onClick={() => setSide("buy")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: side === "buy" ? "#0f766e" : "#f3f4f6", color: side === "buy" ? "white" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              Buy {pair.base.code}
            </button>
            <button onClick={() => setSide("sell")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: side === "sell" ? "#dc2626" : "#f3f4f6", color: side === "sell" ? "white" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              Sell {pair.base.code}
            </button>
          </FlexLayout>
          <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ fontSize: 13, color: "#374151" }}>Amount ({pair.base.code})</Text>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100" type="number" style={{ width: "100%" }} />
          </StackLayout>
          {parsedAmount > 0 && (
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", border: "1px solid #e5e7eb" }}>
              <FlexLayout justify="space-between">
                <Text style={{ fontSize: 13, color: "#6b7280" }}>You {side === "buy" ? "spend" : "receive"}</Text>
                <Text style={{ fontWeight: 600 }}>{total} {pair.quote.code}</Text>
              </FlexLayout>
            </div>
          )}
          {error && <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>}
          {success && <Text style={{ color: "#059669", fontSize: 13 }}>{success}</Text>}
        </StackLayout>
      </DialogContent>
      <DialogActions>
        <Button appearance="bordered" onClick={onClose}>Cancel</Button>
        <Button appearance="solid" sentiment="accented" onClick={handleTrade}
          disabled={loading || !!success}
          style={{ background: side === "buy" ? "#0f766e" : "#dc2626", color: "white" }}>
          {loading ? "Processing..." : `Confirm ${side === "buy" ? "Buy" : "Sell"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

//  Action cell renderer- needs navigate + setSelectedPair 
const makeActionRenderer = (navigate: (path: string) => void) =>
  (params: ICellRendererParams) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
      <Button
        appearance="solid"
        sentiment="accented"
        style={{
          background: "#0f766e",
          color: "white",
          borderRadius: 8,
          padding: "5px 18px",
          fontWeight: 600,
          fontSize: 13,
        }}
        onClick={() => navigate(`/customer/pairs/${params.data.id}`)}
      >
        Trade
      </Button>
    </div>
  );

// Pair cell renderer- flag + pair code + currency name
const PairCellRenderer = (params: ICellRendererParams) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%" }}>
    <span style={{ fontSize: 22, lineHeight: 1 }}>{params.data.quote.flag}</span>
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", lineHeight: 1.3 }}>
        {params.data.pair}
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {params.data.quote.name}
      </div>
    </div>
  </div>
);

// Change cell renderer
const ChangeCellRenderer = (params: ICellRendererParams) => {
  const pct = parseFloat(params.data.change_pct);
  const isPositive = pct >= 0;
  return (
    <span style={{ fontWeight: 600, fontSize: 14, color: isPositive ? "#059669" : "#dc2626" }}>
      {isPositive ? "↗ +" : "↘ "}{pct.toFixed(2)}%
    </span>
  );
};

export const PairsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedPair, setSelectedPair] = useState<FX.Customer.Pair | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useSWR<FX.Customer.PairsResponse>(
    `/api/v1/pairs/${search ? `?search=${search}` : ""}`,
    fetcher
  );

  const pairs = data?.pairs ?? [];

  // Enrich row data with spread so valueGetters can be simple field reads
  const rowData = useMemo(() =>
    pairs.map((p) => ({
      ...p,
      rate_num: parseFloat(p.rate),
      spread: calcSpread(p.rate),
    })),
    [pairs]
  );

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: "Pair",
      field: "pair",
      flex: 2,
      minWidth: 180,
      sortable: true,
      cellRenderer: PairCellRenderer,
    },
    {
      headerName: "Current Rate",
      field: "rate_num",
      flex: 1,
      minWidth: 120,
      sortable: true,
      type: "rightAligned",
      valueFormatter: (p) => parseFloat(p.value).toFixed(4),
      cellStyle: () => ({ fontWeight: 600, fontSize: "15px" })
    },
    {
      headerName: "24h Change",
      field: "change_pct",
      flex: 1,
      minWidth: 120,
      sortable: true,
      type: "rightAligned",
      cellRenderer: ChangeCellRenderer,
    },
    {
      headerName: "Spread",
      field: "spread",
      flex: 1,
      minWidth: 100,
      sortable: true,
      type: "rightAligned",
      cellStyle: { fontSize: "14px", color: "#374151" },
    },
    {
      headerName: "Action",
      field: "id",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filter: false,
      type: "rightAligned",
      cellRenderer: makeActionRenderer(navigate),
    },
  ], [navigate]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: false,
    suppressMovable: true,
  }), []);

  const gridHeight = Math.min(560, pairs.length * 58 + 50);

  return (
    <StackLayout gap={0}>
      {/* Search bar — full-bleed, debounced, auto-focuses */}
      <div style={{ margin: "-24px -24px 0", overflow: "hidden" }}>
        <CurrencySearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search pairs (e.g., GBP/USD)..."
          autoFocus
          subtitle={
            !isLoading
              ? `Showing ${pairs.length} trading ${pairs.length === 1 ? "pair" : "pairs"}`
              : undefined
          }
        />
      </div>

      {/* Count line */}
      <div style={{ padding: "20px 0 12px" }}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          Showing <strong style={{ color: "#111827" }}>{pairs.length}</strong> trading pairs
        </Text>
      </div>

      <Card style={{
        padding: 0,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 60 }}>
            <Spinner />
          </FlexLayout>
        ) : pairs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No pairs found for "{search}"</Text>
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: gridHeight }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={58}
              headerHeight={46}
              suppressCellFocus
              suppressMovableColumns
              getRowId={(p) => String(p.data.id)}
              animateRows
            />
          </div>
        )}
      </Card>

      {selectedPair && (
        <TradeModal pair={selectedPair} onClose={() => setSelectedPair(null)} />
      )}
    </StackLayout>
  )
}