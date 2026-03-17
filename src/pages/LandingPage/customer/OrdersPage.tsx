import { useState, useMemo, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-quartz.css";

// import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]); //I will move this part in seperate module.registry file

import {
  Card,
  FlexLayout,
  StackLayout,
  Text,
  Button,
  Spinner,
} from "@salt-ds/core";
import { fetcher } from "../../../api/swr";
import { apiFetch } from "../../../api/client";


interface Order {
  id: number;
  pair: string;
  side: "buy" | "sell";
  amount: string;
  limit_rate: string;
  status: "open" | "filled" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  orders: Order[];
}

interface Trade {
  id: number;
  pair: string;
  side: "buy" | "sell";
  amount: string;
  rate: string;
  total: string;
  executed_at: string;
}

interface TradesResponse {
  trades: Trade[];
}

type TabStatus = "all" | "open" | "filled" | "cancelled"


const StatusBadge = ({ value }: { value: string }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    open: { bg: "#fef9c3", color: "#854d0e" },
    filled: { bg: "#dcfce7", color: "#166534" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
  };
  const style = colors[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        textTransform: "capitalize",
      }}
    >
      {value}
    </span>
  )
}


const CancelButtonCell = (params: ICellRendererParams) => {
  const [loading, setLoading] = useState(false);

  if (params.data?.status !== "open") return null;

  const handleCancel = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/v1/orders/${params.data.id}/cancel/`, {
        method: "POST",
        auth: true,
      });
      mutate((key: string) => key.startsWith("/api/v1/orders/"));
      mutate("/api/v1/dashboard/summary/");
    } catch (e) {
      console.error("Cancel failed", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      appearance="bordered"
      onClick={handleCancel}
      disabled={loading}
      style={{
        borderColor: "#dc2626",
        color: "#dc2626",
        borderRadius: 6,
        fontSize: 12,
        padding: "2px 12px",
      }}
    >
      {loading ? "loading..." : "Cancel"}
    </Button>
  )
}


const TabBtn = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      borderRadius: 0,
      borderBottom: active ? "2px solid #0f766e" : "2px solid transparent",
      color: active ? "#0f766e" : "#6b7280",
      fontWeight: active ? 700 : 500,
      fontSize: 14,
      padding: "10px 16px",
      cursor: "pointer",
      marginRight: 8,
      transition: "all 0.15s",
    }}
  >
    {label} ({count})
  </button>
)

export const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const { data: allOrdersData, isLoading: ordersLoading } = useSWR<OrdersResponse>(
    "/api/v1/orders/",
    fetcher
  );

  const { data: tradesData, isLoading: tradesLoading } = useSWR<TradesResponse>(
    "/api/v1/trades/",
    fetcher
  );

  //   const isLoading = ordersLoading || tradesLoading;
  const isLoading = !allOrdersData || !tradesData;

  const { counts, activeOrders } = useMemo(() => {
    const allOrders = allOrdersData?.orders ?? [];
    const allTrades = tradesData?.trades ?? [];

    const normalizedTrades = allTrades.map(t => ({
      id: `m-${t.id}`,
      pair: t.pair,
      side: t.side,
      amount: t.amount,
      limit_rate: t.rate,
      status: "filled" as const,
      created_at: t.executed_at,
      updated_at: t.executed_at,
      type: "market",
      total: t.total,
    }))

    const normalizedOrders = allOrders.map(order => ({
      ...order,
      type: "limit",
      total: (parseFloat(order.amount) * parseFloat(order.limit_rate)).toFixed(2),
    }))

    const counts = {
      all: normalizedTrades.length + normalizedOrders.length,
      open: normalizedOrders.filter(o => o.status === "open").length,
      filled: normalizedOrders.filter(o => o.status === "filled").length + normalizedTrades.length,
      cancelled: normalizedOrders.filter(o => o.status === "cancelled").length,
    };

    let activeOrders;
    switch (activeTab) {
      case "open": activeOrders = normalizedOrders.filter(o => o.status === "open"); break;
      case "filled": activeOrders = [...normalizedTrades, ...normalizedOrders.filter(o => o.status === "filled")]; break;
      case "cancelled": activeOrders = normalizedOrders.filter(o => o.status === "cancelled"); break;
      default: activeOrders = [...normalizedTrades, ...normalizedOrders];
    }

    return { counts, activeOrders };
  }, [allOrdersData, tradesData, activeTab]);

  console.log("activeOrders:", activeOrders);
  //   const allOrders = allOrdersData?.orders ?? [];
  // const allTrades = tradesData?.trades ?? [];

  // const normalizedTrades = allTrades.map(t => ({
  //   id: `m-${t.id}`,
  //   pair: t.pair,
  //   side: t.side,
  //   amount: t.amount,
  //   limit_rate: t.rate,
  //   status: "filled" as const,
  //   created_at: t.executed_at,
  //   updated_at: t.executed_at,
  //   type: "market",
  //   total: t.total,
  // }))

  // const normalizedOrders = allOrders.map(o => ({
  //   ...o,
  //   type: "limit",
  //   total: (parseFloat(o.amount) * parseFloat(o.limit_rate)).toFixed(2),
  // }))

  // const counts = {
  //   all:       normalizedTrades.length + normalizedOrders.length,
  //   open:      normalizedOrders.filter(o => o.status === "open").length,
  //   filled:    normalizedOrders.filter(o => o.status === "filled").length + normalizedTrades.length,
  //   cancelled: normalizedOrders.filter(o => o.status === "cancelled").length,
  // }

  //   const counts = {
  //     open:      openData?.orders.length ?? 0,
  //     filled:    filledData?.orders.length ?? 0,
  //     cancelled: cancelledData?.orders.length ?? 0,
  //   }

  // const activeOrders = useMemo(() => {
  //     const all = [...normalizedTrades, ...normalizedOrders];

  //     switch (activeTab) {
  //       case "all":       return all;
  //       case "open":      return normalizedOrders.filter(o => o.status === "open");
  //       case "filled":    return [...normalizedTrades, ...normalizedOrders.filter(o => o.status === "filled")];
  //       case "cancelled": return normalizedOrders.filter(o => o.status === "cancelled");
  //       default:          return all;
  //     }
  //   }, [activeTab, normalizedTrades, normalizedOrders]);

  //   const activeOrders: Order[] =
  //     activeTab === "open"
  //       ? openData?.orders ?? []
  //       : activeTab === "filled"
  //       ? filledData?.orders ?? []
  //       : cancelledData?.orders ?? [];

  //   const isLoading =
  //     (activeTab === "open" && !openData) ||
  //     (activeTab === "filled" && !filledData) ||
  //     (activeTab === "cancelled" && !cancelledData);


  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Date & Time",
        field: "created_at",
        flex: 1.5,
        minWidth: 160,
        valueFormatter: (p) =>
          new Date(p.value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        sortable: true,
        sort: "desc",
      },
      {
        headerName: "Type",
        field: "side",
        flex: 0.8,
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
        headerName: "Pair",
        field: "pair",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => (
          <Text style={{ fontWeight: 600 }}>{p.value}</Text>
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
        flex: 1,
        minWidth: 120,
        valueGetter: (p) => {
          const amount = parseFloat(p.data?.amount ?? "0");
          const rate = parseFloat(p.data?.limit_rate ?? "0");
          return (amount * rate).toLocaleString("en-GB", {
            minimumFractionDigits: 2,
          });
        },
      },
      {
        headerName: "Target Rate",
        field: "limit_rate",
        flex: 1,
        minWidth: 110,
        valueFormatter: (p) => parseFloat(p.value).toFixed(4),
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 110,
        cellRenderer: (p: ICellRendererParams) => (
          <StatusBadge value={p.value} />
        ),
      },
      {
        headerName: "Actions",
        flex: 1,
        minWidth: 100,
        cellRenderer: CancelButtonCell,
        sortable: false,
        filter: false,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: false,
    }),
    []
  )

  return (
    <StackLayout gap={3}>
      <Card
        style={{
          padding: "24px 28px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <Text style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
          Order Management
        </Text>

        {/* Tabs */}
        {/* <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}> */}
        <div style={{ borderBottom: "1px solid #e5e7eb" }}>
          <TabBtn label="All"
            count={counts.all}
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")} />

          <TabBtn
            label="Pending"
            count={counts.open}
            active={activeTab === "open"}
            onClick={() => setActiveTab("open")}
          />
          <TabBtn
            label="Executed"
            count={counts.filled}
            active={activeTab === "filled"}
            onClick={() => setActiveTab("filled")}
          />
          <TabBtn
            label="Cancelled"
            count={counts.cancelled}
            active={activeTab === "cancelled"}
            onClick={() => setActiveTab("cancelled")}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 60 }}>
            <Spinner />
          </FlexLayout>
        ) : activeOrders.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            {activeTab === "all" && "No orders or trades yet"}
            {activeTab === "open" && "No pending orders"}
            {activeTab === "filled" && "No executed orders"}
            {activeTab === "cancelled" && "No cancelled orders"}
          </div>
        ) : (
          <div
            // className="ag-theme-quartz"
            className="ag-theme-alpine"
            style={{ width: "100%", height: Math.min(400, activeOrders.length * 58 + 50) }}
          // style={{ width: "100%", height: 400 }} 
          >
            <AgGridReact
              rowData={activeOrders}
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