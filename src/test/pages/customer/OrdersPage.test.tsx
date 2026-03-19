import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { OrdersPage } from "../../../pages/customer/OrdersPage"

vi.mock("../../../hooks/customer/useOrders", () => ({ useOrders: vi.fn() }))
vi.mock("ag-grid-react", () => ({ AgGridReact: () => <div data-testid="ag-grid" /> }))
vi.mock("../../../components/ui/TabBtn", () => ({
  TabBtn: ({ label, count, active, onClick }: any) => (
    <button data-testid="tab-btn" className={active ? "active" : ""} onClick={onClick}>
      {label} ({count})
    </button>
  ),
}))
vi.mock("../../../components/grid/CellRenderers", () => ({
  StatusBadgeCellRenderer: () => <span>status</span>,
  CancelButtonCell: () => <button>Cancel</button>,
}))

import { useOrders } from "../../../hooks/customer/useOrders"
const mockUseOrders = vi.mocked(useOrders)

const mockActiveOrders = [
  { id: "m-1", pair: "GBP/USD", side: "buy",  amount: "1000", limit_rate: "1.2850", status: "filled",    created_at: "2026-03-17T10:00:00Z", type: "market" },
  { id: "l-1", pair: "GBP/EUR", side: "sell", amount: "500",  limit_rate: "1.1700", status: "open",      created_at: "2026-03-16T10:00:00Z", type: "limit"  },
]

const defaultHook = {
  counts: { all: 5, open: 1, filled: 3, cancelled: 1 },
  activeOrders: mockActiveOrders,
  isLoading: false,
}

describe("OrdersPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOrders.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders Order Management title", () => {
      render(<OrdersPage />)
      expect(screen.getByText("Order Management")).toBeInTheDocument()
    })

    it("renders 4 tab buttons", () => {
      render(<OrdersPage />)
      expect(screen.getAllByTestId("tab-btn")).toHaveLength(4)
    })

    it("renders All tab with count", () => {
      render(<OrdersPage />)
      expect(screen.getByText("All (5)")).toBeInTheDocument()
    })

    it("renders Pending tab with count", () => {
      render(<OrdersPage />)
      expect(screen.getByText("Pending (1)")).toBeInTheDocument()
    })

    it("renders Executed tab with count", () => {
      render(<OrdersPage />)
      expect(screen.getByText("Executed (3)")).toBeInTheDocument()
    })

    it("renders Cancelled tab with count", () => {
      render(<OrdersPage />)
      expect(screen.getByText("Cancelled (1)")).toBeInTheDocument()
    })

    it("renders ag grid when orders available", () => {
      render(<OrdersPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })
  })

  describe("loading state", () => {
    it("shows spinner when loading", () => {
      mockUseOrders.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<OrdersPage />)
      expect(document.querySelector(".orders-spinner")).toBeInTheDocument()
    })
  })

  describe("empty state", () => {
    it("shows empty message for all tab", () => {
      mockUseOrders.mockReturnValue({ ...defaultHook, activeOrders: [] })
      render(<OrdersPage />)
      expect(screen.getByText("No orders or trades yet")).toBeInTheDocument()
    })

    it("shows pending empty message when open tab active", () => {
      mockUseOrders.mockReturnValue({ ...defaultHook, activeOrders: [] })
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Pending (1)"))
      expect(screen.getByText("No pending orders")).toBeInTheDocument()
    })

    it("shows executed empty message when filled tab active", () => {
      mockUseOrders.mockReturnValue({ ...defaultHook, activeOrders: [] })
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Executed (3)"))
      expect(screen.getByText("No executed orders")).toBeInTheDocument()
    })

    it("shows cancelled empty message when cancelled tab active", () => {
      mockUseOrders.mockReturnValue({ ...defaultHook, activeOrders: [] })
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Cancelled (1)"))
      expect(screen.getByText("No cancelled orders")).toBeInTheDocument()
    })
  })

  describe("tab switching", () => {
    it("All tab is active by default", () => {
      render(<OrdersPage />)
      const allTab = screen.getByText("All (5)").closest("[data-testid='tab-btn']")
      expect(allTab).toHaveClass("active")
    })

    it("calls useOrders with all by default", () => {
      render(<OrdersPage />)
      expect(mockUseOrders).toHaveBeenCalledWith("all")
    })

    it("calls useOrders with open when Pending tab clicked", () => {
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Pending (1)"))
      expect(mockUseOrders).toHaveBeenCalledWith("open")
    })

    it("calls useOrders with filled when Executed tab clicked", () => {
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Executed (3)"))
      expect(mockUseOrders).toHaveBeenCalledWith("filled")
    })

    it("calls useOrders with cancelled when Cancelled tab clicked", () => {
      render(<OrdersPage />)
      fireEvent.click(screen.getByText("Cancelled (1)"))
      expect(mockUseOrders).toHaveBeenCalledWith("cancelled")
    })
  })

})