import { useState, useMemo } from "react"
import useSWR from "swr"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Button,
  Spinner,
  Input,
} from "@salt-ds/core"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"
import { StatCard } from "../../../components/ui/StatCard"
import { CurrencySearchBar } from "../../../components/ui/CurrencySearchBar"
import { useIsMobile } from "../../../hooks/UseIsMobile"

import type { FX } from "../../../types/FX"
import { SearchIcon } from "@salt-ds/icons"

ModuleRegistry.registerModules([AllCommunityModule])

export const HistoryPage = () => {
  const [search, setSearch] = useState("")
  const isMobile = useIsMobile()

  const { data: tradesData, isLoading: tradesLoading } =
    useSWR<FX.Customer.TradesResponse>("/api/v1/trades/", fetcher)

  const { data: allOrdersData, isLoading: ordersLoading } =
    useSWR<FX.Customer.OrdersResponse>("/api/v1/orders/", fetcher)

  const isLoading = tradesLoading || ordersLoading

  // Normalize & Merge all trades 
  const { stats, allRows, filteredRows } = useMemo(() => {
    const trades = tradesData?.trades ?? []
    const orders = allOrdersData?.orders ?? []

    // Normalizing market trades
    const normalizedTrades = trades.map((t) => ({
      id: `m-${t.id}`,
      date: t.executed_at,
      pair: t.pair,
      side: t.side,
      amount: parseFloat(t.amount),
      rate: parseFloat(t.rate),
      total: parseFloat(t.total),
      type: "Market",
      status: "Executed",
    }))

    // Normalizing limit orders (all statuses)
    const normalizedOrders = orders.map((o) => ({
      id: `l-${o.id}`,
      date: o.updated_at,
      pair: o.pair,
      side: o.side,
      amount: parseFloat(o.amount),
      rate: parseFloat(o.limit_rate),
      total: parseFloat(o.amount) * parseFloat(o.limit_rate),
      type: "Limit",
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
    }))

    const allRows = [...normalizedTrades, ...normalizedOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Stats count
    const totalTrades = allRows.length;
    const marketCount = normalizedTrades.length;
    const limitCount = normalizedOrders.length;

    // Total volume in GBP — sum of all trade totals
    // Market trades: total is already in quote currency (GBP based pairs)
    // We are using total field as proxy for GBP volume
    const totalVolumeGBP = normalizedTrades.reduce((sum, t) => {
      // GBP/other pair — amount is GBP spent/received
      return sum + t.amount;
    }, 0)

    // Most traded pair
    const pairCount: Record<string, number> = {};
    allRows.forEach((r) => {
      pairCount[r.pair] = (pairCount[r.pair] ?? 0) + 1;
    })
    const mostTraded =
      Object.entries(pairCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // Search filter
    const filteredRows = search
      ? allRows.filter((r) =>
        r.pair.toLowerCase().includes(search.toLowerCase())
      )
      : allRows

    return {
      stats: { totalTrades, marketCount, limitCount, totalVolumeGBP, mostTraded },
      allRows,
      filteredRows,
    }
  }, [tradesData, allOrdersData, search]);


  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Date & Time",
        field: "date",
        flex: 1.5,
        minWidth: 160,
        sort: "desc",
        valueFormatter: (p) =>
          new Date(p.value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        headerName: "Type",
        field: "type",
        flex: 0.8,
        minWidth: 90,
        cellRenderer: (p: ICellRendererParams) => (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              background: p.value === "Market" ? "#dbeafe" : "#fef9c3",
              color: p.value === "Market" ? "#1d4ed8" : "#854d0e",
            }}
          >
            {p.value}
          </span>
        ),
      },
      {
        headerName: "Pair",
        field: "pair",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => (
          <Text style={{ fontWeight: 600 }}>{p.value}</Text>
        ),
      },
      {
        headerName: "Side",
        field: "side",
        flex: 0.7,
        minWidth: 80,
        cellRenderer: (p: ICellRendererParams) => (
          <span
            style={{
              fontWeight: 600,
              color: p.value === "buy" ? "#059669" : "#dc2626",
              textTransform: "capitalize",
            }}
          >
            {p.value}
          </span>
        ),
      },
      {
        headerName: "From Amount",
        field: "amount",
        flex: 1,
        minWidth: 120,
        valueFormatter: (p) =>
          parseFloat(p.value).toLocaleString("en-GB", {
            minimumFractionDigits: 2,
          }),
      },
      {
        headerName: "To Amount",
        field: "total",
        flex: 1,
        minWidth: 120,
        valueFormatter: (p) =>
          parseFloat(p.value).toLocaleString("en-GB", {
            minimumFractionDigits: 2,
          }),
      },
      {
        headerName: "Rate",
        field: "rate",
        flex: 0.9,
        minWidth: 100,
        valueFormatter: (p) => parseFloat(p.value).toFixed(4),
      },
      {
        headerName: "Status",
        field: "status",
        flex: 0.9,
        minWidth: 110,
        cellRenderer: (p: ICellRendererParams) => {
          const colors: Record<string, { bg: string; color: string }> = {
            Executed: { bg: "#dcfce7", color: "#166534" },
            Filled: { bg: "#dcfce7", color: "#166534" },
            Open: { bg: "#fef9c3", color: "#854d0e" },
            Cancelled: { bg: "#fee2e2", color: "#991b1b" },
          };
          const s = colors[p.value] ?? { bg: "#f3f4f6", color: "#374151" };
          return (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: s.bg,
                color: s.color,
              }}
            >
              {p.value}
            </span>
          );
        },
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, sortable: true }),
    []
  )

  const handleExport = async () => {
    try {
      const blob = await apiFetch<Blob>("/api/v1/trades/export/", {
        auth: true,
      });
      const url = URL.createObjectURL(new Blob([blob as any]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "trades.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  }

  return (
    <StackLayout gap={3}>

      <FlexLayout gap={2} wrap>
        <StatCard
          label="Total Trades"
          value={isLoading ? "..." : stats.totalTrades}
        />
        <StatCard
          label="Market Trades"
          value={isLoading ? "..." : stats.marketCount}
        />
        <StatCard
          label="Limit Orders"
          value={isLoading ? "..." : stats.limitCount}
        />
        <StatCard
          label="Total Volume"
          value={
            isLoading
              ? "..."
              : stats.totalVolumeGBP.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
              })
          }
          sub="GBP"
        />
        <StatCard
          label="Most Traded"
          value={isLoading ? "..." : stats.mostTraded}
        />
      </FlexLayout>

      <Card
        style={{
          padding: "24px 28px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >

<StackLayout gap={1} style={{ marginBottom: 20 }}>
<FlexLayout align="center" justify="space-between" gap={1}>
  <Text style={{ fontWeight: 700, fontSize: 18 }}>All Trades</Text>
  <Button
      appearance="bordered"
      onClick={handleExport}
      style={{ borderRadius: 8, fontWeight: 600, flexShrink: 0 }}
    >
      Export
    </Button>
    </FlexLayout>
  <FlexLayout align="center" justify="space-between" gap={1}>
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search by pair..."
      style={{ flex: 1, borderRadius: 8 }}
      startAdornment={
        <span style={{ color: "#9ca3af", paddingLeft: 4 }}><SearchIcon/></span>
      }
    />
   
  </FlexLayout>
</StackLayout>

        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 60 }}>
            <Spinner />
          </FlexLayout>
        ) : filteredRows.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            {search ? `No trades found for "${search}"` : "No trades yet. Start by exchanging currencies!"}
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 400 }}>
            <AgGridReact
              rowData={filteredRows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={52}
              headerHeight={46}
              suppressMovableColumns
              suppressCellFocus
              getRowId={(params) => String(params.data.id)}
            />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}