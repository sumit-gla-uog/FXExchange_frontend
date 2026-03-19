import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HistoryPage } from "../../../pages/customer/HistoryPage"

vi.mock("../../../hooks/customer/useHistory", () => ({ useHistory: vi.fn() }))
vi.mock("ag-grid-react", () => ({ AgGridReact: () => <div data-testid="ag-grid" /> }))
vi.mock("../../../components/ui/StatCard", () => ({
  StatCard: ({ label, value, sub }: any) => (
    <div data-testid="stat-card"><span>{label}</span><span>{value}</span>{sub && <span>{sub}</span>}</div>
  ),
}))
vi.mock("../../../components/grid/CellRenderers", () => ({
  StatusBadgeCellRenderer: () => <span>status</span>,
}))

import { useHistory } from "../../../hooks/customer/useHistory"
const mockUseHistory = vi.mocked(useHistory)

const mockStats = {
  totalTrades: 10,
  marketCount: 7,
  limitCount: 3,
  totalVolumeGBP: 15000,
  mostTraded: "GBP/USD",
}

const mockRows = [
  { id: "m-1", date: "2026-03-17T10:00:00Z", pair: "GBP/USD", side: "buy",  amount: 1000, rate: 1.285,  total: 1285,  type: "Market", status: "Executed" },
  { id: "l-1", date: "2026-03-16T10:00:00Z", pair: "GBP/EUR", side: "sell", amount: 500,  rate: 1.18,   total: 590,   type: "Limit",  status: "Filled" },
]

const defaultHook = {
  stats: mockStats,
  filteredRows: mockRows,
  isLoading: false,
  handleExport: vi.fn(),
}

describe("HistoryPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseHistory.mockReturnValue(defaultHook)
  })

  describe("stat cards", () => {
    it("renders 5 stat cards", () => {
      render(<HistoryPage />)
      expect(screen.getAllByTestId("stat-card")).toHaveLength(5)
    })

    it("renders Total Trades stat", () => {
      render(<HistoryPage />)
      expect(screen.getByText("Total Trades")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()
    })

    it("renders Market Trades stat", () => {
      render(<HistoryPage />)
      expect(screen.getByText("Market Trades")).toBeInTheDocument()
      expect(screen.getByText("7")).toBeInTheDocument()
    })

    it("renders Limit Orders stat", () => {
      render(<HistoryPage />)
      expect(screen.getByText("Limit Orders")).toBeInTheDocument()
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("renders Most Traded stat", () => {
      render(<HistoryPage />)
      expect(screen.getByText("Most Traded")).toBeInTheDocument()
      expect(screen.getByText("GBP/USD")).toBeInTheDocument()
    })

    it("shows ... for stats when loading", () => {
      mockUseHistory.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<HistoryPage />)
      expect(screen.getAllByText("...")).toHaveLength(5)
    })
  })

  describe("all trades section", () => {
    it("renders All Trades heading", () => {
      render(<HistoryPage />)
      expect(screen.getByText("All Trades")).toBeInTheDocument()
    })

    it("renders Export button", () => {
      render(<HistoryPage />)
      expect(screen.getByText("Export")).toBeInTheDocument()
    })

    it("renders search input", () => {
      render(<HistoryPage />)
      expect(screen.getByPlaceholderText("Search by pair...")).toBeInTheDocument()
    })

    it("renders ag grid when rows available", () => {
      render(<HistoryPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })
  })

  describe("loading and empty states", () => {
    it("shows spinner when loading", () => {
      mockUseHistory.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<HistoryPage />)
      expect(document.querySelector(".history-spinner")).toBeInTheDocument()
    })

    it("shows empty message when no rows and no search", () => {
      mockUseHistory.mockReturnValue({ ...defaultHook, filteredRows: [] })
      render(<HistoryPage />)
      expect(screen.getByText(/No trades yet/)).toBeInTheDocument()
    })

    it("shows search empty message when search has no results", () => {
      mockUseHistory.mockReturnValue({ ...defaultHook, filteredRows: [] })
      render(<HistoryPage />)
      fireEvent.change(screen.getByPlaceholderText("Search by pair..."), { target: { value: "xyz" } })
      expect(screen.getByText(/No trades found/)).toBeInTheDocument()
    })
  })

  describe("export", () => {
    it("calls handleExport when Export button clicked", () => {
      render(<HistoryPage />)
      fireEvent.click(screen.getByText("Export"))
      expect(defaultHook.handleExport).toHaveBeenCalledTimes(1)
    })
  })

  describe("search", () => {
    it("passes search to useHistory hook", () => {
      render(<HistoryPage />)
      fireEvent.change(screen.getByPlaceholderText("Search by pair..."), { target: { value: "eur" } })
      expect(mockUseHistory).toHaveBeenCalledWith("eur")
    })
  })

})