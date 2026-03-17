import { useState, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { Card, FlexLayout, StackLayout, Text, Button, Spinner, Input } from "@salt-ds/core"
import { SearchIcon } from "@salt-ds/icons"
import { StatCard } from "../../../components/ui/StatCard"
import { StatusBadgeCellRenderer } from "../../../components/grids/CellRenderers"
import { useHistory } from "../../../hooks/customer/useHistory"
import "./HistoryPage.css"

export const HistoryPage = () => {
  const [search, setSearch] = useState("")
  const { stats, filteredRows, isLoading, handleExport } = useHistory(search)

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Date & Time", field: "date",   flex: 1.5, minWidth: 160, sort: "desc", valueFormatter: (p) => new Date(p.value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
    { headerName: "Type",        field: "type",   flex: 0.8, minWidth: 90,  cellRenderer: (p: ICellRendererParams) => <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: p.value === "Market" ? "#dbeafe" : "#fef9c3", color: p.value === "Market" ? "#1d4ed8" : "#854d0e" }}>{p.value}</span> },
    { headerName: "Pair",        field: "pair",   flex: 1,   minWidth: 100, cellRenderer: (p: ICellRendererParams) => <Text style={{ fontWeight: 600 }}>{p.value}</Text> },
    { headerName: "Side",        field: "side",   flex: 0.7, minWidth: 80,  cellRenderer: (p: ICellRendererParams) => <span style={{ fontWeight: 600, color: p.value === "buy" ? "#059669" : "#dc2626", textTransform: "capitalize" }}>{p.value}</span> },
    { headerName: "From Amount", field: "amount", flex: 1,   minWidth: 120, valueFormatter: (p) => parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }) },
    { headerName: "To Amount",   field: "total",  flex: 1,   minWidth: 120, valueFormatter: (p) => parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }) },
    { headerName: "Rate",        field: "rate",   flex: 0.9, minWidth: 100, valueFormatter: (p) => parseFloat(p.value).toFixed(4) },
    { headerName: "Status",      field: "status", flex: 0.9, minWidth: 110, cellRenderer: StatusBadgeCellRenderer },
  ], [])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true }), [])

  return (
    <StackLayout gap={3}>
      <FlexLayout gap={2} wrap>
        <StatCard label="Total Trades"  value={isLoading ? "..." : stats.totalTrades} />
        <StatCard label="Market Trades" value={isLoading ? "..." : stats.marketCount} />
        <StatCard label="Limit Orders"  value={isLoading ? "..." : stats.limitCount} />
        <StatCard label="Total Volume"  value={isLoading ? "..." : stats.totalVolumeGBP.toLocaleString("en-GB", { minimumFractionDigits: 2 })} sub="GBP" />
        <StatCard label="Most Traded"   value={isLoading ? "..." : stats.mostTraded} />
      </FlexLayout>

      <Card className="history-card">
        <StackLayout gap={1} className="history-header">
          <FlexLayout align="center" justify="space-between" gap={1}>
            <Text className="history-title">All Trades</Text>
            <Button appearance="bordered" onClick={handleExport} className="history-export-btn">Export</Button>
          </FlexLayout>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by pair..." className="history-search" startAdornment={<span className="history-search-icon"><SearchIcon /></span>} />
        </StackLayout>

        {isLoading ? (
          <div className="history-spinner"><Spinner /></div>
        ) : filteredRows.length === 0 ? (
          <div className="history-empty">
            {search ? `No trades found for "${search}"` : "No trades yet. Start by exchanging currencies!"}
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 400 }}>
            <AgGridReact rowData={filteredRows} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={52} headerHeight={46} suppressMovableColumns suppressCellFocus getRowId={(p) => String(p.data.id)} />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}