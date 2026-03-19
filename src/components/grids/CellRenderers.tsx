import { useState } from "react"
import { Button } from "@salt-ds/core"
import type { ICellRendererParams } from "ag-grid-community"
import { mutate } from "swr"
import { apiFetch } from "../../api/client"
import { CurrencyFlag } from "../ui/CurrencyFlag"
import "./CellRenderers.css"

// Currency cell , flag + code + name
export const CurrencyCellRenderer = (p: ICellRendererParams) => (
  <div className="cell-currency">
    <span className="flag"><CurrencyFlag code={p.data.currency.code} size={1.2} /></span>
    <div>
      <div className="code">{p.data.currency.code}</div>
      <div className="name">{p.data.currency.name}</div>
    </div>
  </div>
)

// Pair cell , flag + pair string + quote name
export const PairCellRenderer = (p: ICellRendererParams) => (
  <div className="cell-pair">
    <span className="flag"><CurrencyFlag code={p.data.quote.code} size={1.2} /></span>
    <div>
      <div className="code">{p.data.pair}</div>
      <div className="name">{p.data.quote.name}</div>
    </div>
  </div>
)

// Change, coloured and with arrow
export const ChangeCellRenderer = (p: ICellRendererParams) => {
  const pct = parseFloat(p.data.change_pct)
  if (isNaN(pct)) return <span className="cell-change empty">—</span>
  const isPositive = pct >= 0
  return (
    <span className={`cell-change ${isPositive ? "positive" : "negative"}`}>
      {isPositive ? "↗ +" : "↘ "}{pct.toFixed(2)}%
    </span>
  )
}

// Status badge
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open:      { bg: "#fef9c3", color: "#854d0e" },
  filled:    { bg: "#dcfce7", color: "#166534" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
  Executed:  { bg: "#dcfce7", color: "#166534" },
  Filled:    { bg: "#dcfce7", color: "#166534" },
  Open:      { bg: "#fef9c3", color: "#854d0e" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b" },
}

export const StatusBadge = ({ value }: { value: string }) => {
  const s = STATUS_COLORS[value] ?? { bg: "#f3f4f6", color: "#374151" }
  return (
    <span
      className="cell-status-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {value}
    </span>
  )
}

export const StatusBadgeCellRenderer = (p: ICellRendererParams) => (
  <StatusBadge value={String(p.value)} />
)

// Cancel button , only for open orders
export const CancelButtonCell = (params: ICellRendererParams) => {
  const [loading, setLoading] = useState(false)
  if (params.data?.status !== "open") return null

  const handleCancel = async () => {
    setLoading(true)
    try {
      await apiFetch(`/api/v1/orders/${params.data.id}/cancel/`, { method: "POST", auth: true })
      mutate((key: string) => key.startsWith("/api/v1/orders/"))
      mutate("/api/v1/dashboard/summary/")
    } catch (e) {
      console.error("Cancel failed", e)
    } finally { setLoading(false) }
  }

  return (
    <Button
      appearance="bordered"
      onClick={handleCancel}
      disabled={loading}
      style={{ borderColor: "#dc2626", color: "#dc2626", borderRadius: 6, fontSize: 12, padding: "2px 12px" }}
    >
      {loading ? "..." : "Cancel"}
    </Button>
  )
}

// Trade action ,navigates to pair detail
export const makeTradeActionRenderer = (navigate: (path: string) => void) =>
  (params: ICellRendererParams) => (
    <div className="cell-action">
      <Button
        appearance="solid"
        sentiment="accented"
        style={{ background: "#0f766e", color: "white", borderRadius: 8, padding: "5px 18px", fontWeight: 600, fontSize: 13 }}
        onClick={() => navigate(`/customer/pairs/${params.data.id}`)}
      >
        Trade
      </Button>
    </div>
  )

// Portfolio trade action , navigates to pairs list
export const makePortfolioTradeRenderer = (navigate: (path: string) => void) =>
  (_p: ICellRendererParams) => (
    <div className="cell-action">
      <Button
        appearance="solid"
        sentiment="accented"
        style={{ background: "#0f766e", color: "white", borderRadius: 8, fontSize: 13, padding: "5px 16px" }}
        onClick={() => navigate("/customer/pairs")}
      >
        Trade
      </Button>
    </div>
  )