import { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { Card, FlexLayout, StackLayout, Text, Input, Button, Spinner, Dialog, DialogHeader, DialogContent, DialogActions } from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"
import { useNavigate } from "react-router-dom"
import { CurrencySearchBar } from "../../../components/ui/CurrencySearchBar"
import type { FX } from "../../../types/FX"
import { PairCellRenderer, ChangeCellRenderer, makeTradeActionRenderer } from "../../../components/grids/CellRenderers"
import "./PairsPage.css"

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
    if (!amount || parsedAmount <= 0) { setError("Please enter a valid amount"); return }
    setLoading(true); setError("")
    try {
      await apiFetch("/api/v1/trades/market/", { method: "POST", auth: true, body: JSON.stringify({ pair_id: pair.id, side, amount }) })
      setSuccess(`${side === "buy" ? "Bought" : "Sold"} ${amount} ${pair.base.code} successfully!`)
      mutate("/api/v1/portfolio/"); mutate("/api/v1/dashboard/summary/"); mutate("/api/v1/trades/")
    } catch (e: any) { setError(e.message || "Trade failed") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
      <DialogHeader header={`Trade ${pair.pair}`} />
      <DialogContent>
        <StackLayout gap={2}>
          <div className="trade-modal-rate-box">
            <FlexLayout justify="space-between">
              <Text className="trade-modal-rate-label">Current Rate</Text>
              <Text className="trade-modal-rate-value">{parseFloat(pair.rate).toFixed(4)}</Text>
            </FlexLayout>
          </div>
          <FlexLayout gap={1}>
            <button className={`trade-modal-side-btn buy ${side === "buy" ? "active" : "inactive"}`} onClick={() => setSide("buy")}>Buy {pair.base.code}</button>
            <button className={`trade-modal-side-btn sell ${side === "sell" ? "active" : "inactive"}`} onClick={() => setSide("sell")}>Sell {pair.base.code}</button>
          </FlexLayout>
          <StackLayout gap={0.5}>
            <Text styleAs="label" className="trade-modal-amount-label">Amount ({pair.base.code})</Text>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100" type="number" style={{ width: "100%" }} />
          </StackLayout>
          {parsedAmount > 0 && (
            <div className="trade-modal-summary">
              <FlexLayout justify="space-between">
                <Text className="trade-modal-summary-label">You {side === "buy" ? "spend" : "receive"}</Text>
                <Text style={{ fontWeight: 600 }}>{total} {pair.quote.code}</Text>
              </FlexLayout>
            </div>
          )}
          {error   && <Text className="trade-modal-error">{error}</Text>}
          {success && <Text className="trade-modal-success">{success}</Text>}
        </StackLayout>
      </DialogContent>
      <DialogActions>
        <Button appearance="bordered" onClick={onClose}>Cancel</Button>
        <Button appearance="solid" sentiment="accented" onClick={handleTrade} disabled={loading || !!success} style={{ background: side === "buy" ? "#0f766e" : "#dc2626", color: "white" }}>
          {loading ? "Processing..." : `Confirm ${side === "buy" ? "Buy" : "Sell"}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const PairsPage = () => {
  const [search, setSearch] = useState("")
  const [selectedPair, setSelectedPair] = useState<FX.Customer.Pair | null>(null)
  const navigate = useNavigate()

  const { data, isLoading } = useSWR<FX.Customer.PairsResponse>(
    `/api/v1/pairs/${search ? `?search=${search}` : ""}`, fetcher
  )

  const pairs = data?.pairs ?? []

  const rowData = useMemo(() =>
    pairs.map((p) => ({ ...p, rate_num: parseFloat(p.rate), spread: calcSpread(p.rate) })),
    [pairs]
  )

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Pair",         field: "pair",     flex: 2, minWidth: 180, sortable: true, cellRenderer: PairCellRenderer },
    { headerName: "Current Rate", field: "rate_num", flex: 1, minWidth: 120, sortable: true, type: "rightAligned", valueFormatter: (p) => parseFloat(p.value).toFixed(4), cellStyle: () => ({ fontWeight: 600, fontSize: "15px" }) },
    { headerName: "24h Change",   field: "change_pct", flex: 1, minWidth: 120, sortable: true, type: "rightAligned", cellRenderer: ChangeCellRenderer },
    { headerName: "Spread",       field: "spread",   flex: 1, minWidth: 100, sortable: true, type: "rightAligned", cellStyle: () => ({ fontSize: "14px", color: "#374151" }) },
    { headerName: "Action",       field: "id",       flex: 1, minWidth: 120, sortable: false, filter: false, type: "rightAligned", cellRenderer: makeTradeActionRenderer(navigate) },
  ], [navigate])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true, filter: false, suppressMovable: true }), [])
  const gridHeight = Math.min(560, pairs.length * 58 + 50)

  return (
    <StackLayout gap={0}>
      <div className="pairs-search-wrapper">
        <CurrencySearchBar value={search} onChange={setSearch} placeholder="Search pairs (e.g., GBP/USD)..." autoFocus subtitle={!isLoading ? `Showing ${pairs.length} trading ${pairs.length === 1 ? "pair" : "pairs"}` : undefined} />
      </div>

      <div className="pairs-count">
        Showing <strong>{pairs.length}</strong> trading pairs
      </div>

      <Card className="pairs-card">
        {isLoading ? (
          <div className="pairs-spinner"><Spinner /></div>
        ) : pairs.length === 0 ? (
          <div className="pairs-empty"><Text style={{ color: "#6b7280" }}>No pairs found for "{search}"</Text></div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: gridHeight }}>
            <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={58} headerHeight={46} suppressCellFocus suppressMovableColumns getRowId={(p) => String(p.data.id)} animateRows />
          </div>
        )}
      </Card>

      {selectedPair && <TradeModal pair={selectedPair} onClose={() => setSelectedPair(null)} />}
    </StackLayout>
  )
}