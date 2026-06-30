import { useNavigate } from "react-router-dom"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { useMemo } from "react"
import { Card, FlexLayout, StackLayout, Text, Spinner } from "@salt-ds/core"
import { CurrencyCellRenderer, ChangeCellRenderer, makePortfolioTradeRenderer } from "../../components/grids/CellRenderers"
import { usePortfolio } from "../../hooks/customer/usePortfolio"
import "./PortfolioPage.css"

const StatTile = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <StackLayout gap={0} className="stat-tile">
    <Text className="label">{label}</Text>
    <Text className="value">{value}</Text>
    <Text className="sub">{sub}</Text>
  </StackLayout>
)

export const PortfolioPage = () => {
  const navigate = useNavigate()
  const { rowData, totalValue, totalHoldings, isLoading } = usePortfolio()

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Currency", field: "currency.code", flex: 2, minWidth: 180, headerClass: "ag-left-aligned-header",  cellRenderer: CurrencyCellRenderer },
    { headerName: "Amount", field: "amount_num", flex: 1, minWidth: 130, headerClass: "ag-right-aligned-header", cellClass: "ag-right-aligned-cell", valueFormatter: (p) => parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }), cellStyle: () => ({ fontWeight: 500, fontSize: "14px" }) },
    { headerName: "Value in GBP", field: "gbp_value_num", flex: 1, minWidth: 140, headerClass: "ag-right-aligned-header", cellClass: "ag-right-aligned-cell", valueFormatter: (p) => parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }), cellStyle: () => ({ fontWeight: 500, fontSize: "14px" }) },
    { headerName: "24h Change", field: "change_pct",    flex: 1, minWidth: 120, headerClass: "ag-right-aligned-header", cellClass: "ag-right-aligned-cell", cellRenderer: ChangeCellRenderer },
    { headerName: "Actions", field: "currency.code", flex: 1, minWidth: 120, sortable: false, filter: false, headerClass: "ag-right-aligned-header", cellClass: "ag-right-aligned-cell", cellRenderer: makePortfolioTradeRenderer(navigate) },
  ], [navigate])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true, filter: false, suppressMovable: true }), [])
  const gridHeight = Math.min(520, rowData.length * 62 + 50)

  return (
    <StackLayout gap={3}>
      <Card className="portfolio-summary-card">
        <Text className="portfolio-summary-title">Portfolio Summary</Text>
        <FlexLayout gap={0} wrap>
          <StatTile label="Total Value"    value={isLoading ? "..." : totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })} sub="GBP" />
          <div className="stat-tile-divider" />
          <StatTile label="Total Holdings" value={isLoading ? "..." : String(totalHoldings)} sub="Currencies" />
          <div className="stat-tile-divider" />
          <StatTile label="Base Currency"  value="GBP" sub="Primary" />
          </FlexLayout>
      </Card>

      <Card className="portfolio-holdings-card">
        <Text className="portfolio-holdings-title">Your Holdings</Text>
        {isLoading ? (
          <div className="portfolio-spinner"><Spinner /></div>
        ) : rowData.length === 0 ? (
          <div className="portfolio-empty"><Text style={{ color: "#9ca3af" }}>No holdings yet</Text></div>
        ) : (
            <div className="ag-theme-alpine" style={{ width: "100%", height: gridHeight }}>
              <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={62} headerHeight={46} suppressCellFocus suppressMovableColumns getRowId={(p) => p.data.currency.code} animateRows />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}