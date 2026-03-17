import { useMemo } from "react"
import useSWR from "swr"
import { useNavigate } from "react-router-dom"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Button,
  Spinner,
} from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import type { FX } from "../../../types/FX"
import { CurrencyCellRenderer, ChangeCellRenderer, makePortfolioTradeRenderer } from "../../../components/grids/CellRenderers"


// TODO: move to utils/
const getChangePct = (
  code: string,
  snapshot: FX.Shared.MarketSnapshot | undefined
): number | null => {
  if (!snapshot) return null
  const match = snapshot.market_snapshot.find(
    (p) => p.pair.startsWith(code + "/") || p.pair.endsWith("/" + code)
  )
  return match ? parseFloat(match.change_pct) : null
}

// Summary stat tile
const StatTile = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <StackLayout gap={0} style={{ flex: 1, minWidth: 140 }}>
    <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginBottom: 6 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 36, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
      {sub}
    </Text>
  </StackLayout>
)


export const PortfolioPage = () => {
  const navigate = useNavigate()

  const { data: portfolio, isLoading } = useSWR<FX.Customer.Portfolio>("/api/v1/portfolio/", fetcher)
  const { data: snapshot } = useSWR<FX.Shared.MarketSnapshot>("/api/v1/dashboard/market-snapshot/", fetcher)

  const totalValue = parseFloat(portfolio?.total_value_gbp ?? "0")
  const totalHoldings = portfolio?.holdings.length ?? 0

  const rowData = useMemo(() =>
    (portfolio?.holdings ?? []).map((h) => ({
      ...h,
      amount_num: parseFloat(h.amount),
      gbp_value_num: h.gbp_value ? parseFloat(h.gbp_value) : 0,
      change_pct: getChangePct(h.currency.code, snapshot),
    })),
    [portfolio, snapshot]
  )

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: "Currency",
      field: "currency.code",
      flex: 2,
      minWidth: 180,
      headerClass: "ag-left-aligned-header",
      cellRenderer: CurrencyCellRenderer,
    },
    {
      headerName: "Amount",
      field: "amount_num",
      flex: 1,
      minWidth: 130,
      headerClass: "ag-right-aligned-header",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) =>
        parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }),
      cellStyle: () => ({ fontWeight: 500, fontSize: "14px" }),
    },
    {
      headerName: "Value in GBP",
      field: "gbp_value_num",
      flex: 1,
      minWidth: 140,
      headerClass: "ag-right-aligned-header",
      cellClass: "ag-right-aligned-cell",
      valueFormatter: (p) =>
        parseFloat(p.value).toLocaleString("en-GB", { minimumFractionDigits: 2 }),
      cellStyle: () => ({ fontWeight: 500, fontSize: "14px" }),
    },
    {
      headerName: "24h Change",
      field: "change_pct",
      flex: 1,
      minWidth: 120,
      headerClass: "ag-right-aligned-header",
      cellClass: "ag-right-aligned-cell",
      cellRenderer: ChangeCellRenderer,
    },
    {
      headerName: "Actions",
      field: "currency.code",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filter: false,
      headerClass: "ag-right-aligned-header",
      cellClass: "ag-right-aligned-cell",
      cellRenderer: makePortfolioTradeRenderer(navigate),
    },
  ], [navigate])

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: false,
    suppressMovable: true,
  }), [])

  const gridHeight = Math.min(520, rowData.length * 62 + 50)

  return (
    <StackLayout gap={3}>

      <Card style={{
        padding: "28px 32px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        <Text style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 24 }}>
          Portfolio Summary
        </Text>

        <FlexLayout gap={0} wrap>
          <StatTile
            label="Total Value"
            value={isLoading ? "..." : totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            sub="GBP"
          />
          <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch", margin: "0 32px" }} />
          <StatTile
            label="Total Holdings"
            value={isLoading ? "..." : String(totalHoldings)}
            sub="Currencies"
          />
          <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch", margin: "0 32px" }} />
          <StatTile
            label="Base Currency"
            value="GBP"
            sub="Primary"
          />
        </FlexLayout>
      </Card>

      <Card style={{
        padding: "24px 28px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        <Text style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 20 }}>
          Your Holdings
        </Text>

        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 40 }}>
            <Spinner />
          </FlexLayout>
        ) : rowData.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Text style={{ color: "#9ca3af" }}>No holdings yet</Text>
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: gridHeight }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={62}
              headerHeight={46}
              suppressCellFocus
              suppressMovableColumns
              getRowId={(p) => p.data.currency.code}
              animateRows
            />
          </div>
        )}
      </Card>

    </StackLayout>
  )
}