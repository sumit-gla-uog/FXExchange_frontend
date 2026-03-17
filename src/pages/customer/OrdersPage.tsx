import { useState, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { Card, FlexLayout, StackLayout, Text, Spinner } from "@salt-ds/core"
import { TabBtn } from "../../components/ui/TabBtn"
import { StatusBadgeCellRenderer, CancelButtonCell } from "../../components/grids/CellRenderers"
import { useOrders } from "../../hooks/customer/useOrders"
import type { FX } from "../../types/FX"
import "./OrdersPage.css"

export const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<FX.Customer.TabStatus>("all")
  const { counts, activeOrders, isLoading } = useOrders(activeTab)

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Date & Time", field: "created_at", flex: 1.5, minWidth: 160, sortable: true, sort: "desc", valueFormatter: (p) => new Date(p.value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
    { headerName: "Type", field: "side", flex: 0.8, minWidth: 80, cellRenderer: (p: ICellRendererParams) => <span style={{ fontWeight: 600, color: p.value === "buy" ? "#059669" : "#dc2626", textTransform: "capitalize" }}>{p.value}</span> },
    { headerName: "Pair", field: "pair", flex: 1, minWidth: 100, cellRenderer: (p: ICellRendererParams) => <Text style={{ fontWeight: 600 }}>{p.value}</Text> },
    { headerName: "From Amount", field: "amount", flex: 1, minWidth: 120, valueFormatter: (p) => parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }) },
    { headerName: "To Amount", flex: 1, minWidth: 120, valueGetter: (p) => (parseFloat(p.data?.amount ?? "0") * parseFloat(p.data?.limit_rate ?? "0")).toLocaleString("en-GB", { minimumFractionDigits: 2 }) },
    { headerName: "Target Rate", field: "limit_rate", flex: 1, minWidth: 110, valueFormatter: (p) => parseFloat(p.value).toFixed(4) },
    { headerName: "Status", field: "status", flex: 1, minWidth: 110, cellRenderer: StatusBadgeCellRenderer },
    { headerName: "Actions", flex: 1, minWidth: 100, cellRenderer: CancelButtonCell, sortable: false, filter: false },
  ], [])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true, filter: false }), [])

  return (
    <StackLayout gap={3}>
      <Card className="orders-card">
        <Text className="orders-title">Order Management</Text>
        <div className="tab-bar">
          <TabBtn label="All"       count={counts.all}       active={activeTab === "all"}       onClick={() => setActiveTab("all")} />
          <TabBtn label="Pending"   count={counts.open}      active={activeTab === "open"}      onClick={() => setActiveTab("open")} />
          <TabBtn label="Executed"  count={counts.filled}    active={activeTab === "filled"}    onClick={() => setActiveTab("filled")} />
          <TabBtn label="Cancelled" count={counts.cancelled} active={activeTab === "cancelled"} onClick={() => setActiveTab("cancelled")} />
        </div>
        {isLoading ? (
          <div className="orders-spinner"><Spinner /></div>
        ) : activeOrders.length === 0 ? (
          <div className="orders-empty">
            {activeTab === "all"       && "No orders or trades yet"}
            {activeTab === "open"      && "No pending orders"}
            {activeTab === "filled"    && "No executed orders"}
            {activeTab === "cancelled" && "No cancelled orders"}
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: Math.min(400, activeOrders.length * 58 + 50) }}>
            <AgGridReact rowData={activeOrders} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={52} headerHeight={46} suppressMovableColumns suppressCellFocus getRowId={(p) => String(p.data.id)} />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}