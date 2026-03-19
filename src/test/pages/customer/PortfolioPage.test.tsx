import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { PortfolioPage } from "../../../pages/customer/PortfolioPage"

vi.mock("../../../hooks/customer/usePortfolio", () => ({ usePortfolio: vi.fn() }))
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }))
vi.mock("ag-grid-react", () => ({ AgGridReact: () => <div data-testid="ag-grid" /> }))
vi.mock("../../../components/grid/CellRenderers", () => ({
  CurrencyCellRenderer: () => <span>currency</span>,
  ChangeCellRenderer:   () => <span>change</span>,
  makePortfolioTradeRenderer: () => () => <button>Trade</button>,
}))

import { usePortfolio } from "../../../hooks/customer/usePortfolio"
const mockUsePortfolio = vi.mocked(usePortfolio)

const mockRowData = [
  { currency: { code: "usd", name: "US Dollar", symbol: "$", flag: "usd" }, amount: "5000", avg_buy_rate: "1.285", gbp_value: "3891.05", amount_num: 5000, gbp_value_num: 3891.05, change_pct: 0.45 },
  { currency: { code: "eur", name: "Euro",       symbol: "€", flag: "eur" }, amount: "2000", avg_buy_rate: "1.180", gbp_value: "1694.92", amount_num: 2000, gbp_value_num: 1694.92, change_pct: -0.30 },
]

const defaultHook = {
  portfolio: { holdings: mockRowData, total_value_gbp: "5585.97" },
  snapshot: undefined,
  rowData: mockRowData,
  totalValue: 5585.97,
  totalHoldings: 2,
  isLoading: false,
}

describe("PortfolioPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePortfolio.mockReturnValue(defaultHook)
  })

  describe("portfolio summary", () => {
    it("renders Portfolio Summary heading", () => {
      render(<PortfolioPage />)
      expect(screen.getByText("Portfolio Summary")).toBeInTheDocument()
    })

    it("renders Total Value stat tile", () => {
      render(<PortfolioPage />)
      expect(screen.getByText("Total Value")).toBeInTheDocument()
    })

    it("renders formatted total value", () => {
      render(<PortfolioPage />)
      expect(screen.getByText("5,585.97")).toBeInTheDocument()
    })

    it("renders Total Holdings stat tile", () => {
      render(<PortfolioPage />)
      expect(screen.getByText("Total Holdings")).toBeInTheDocument()
      expect(screen.getByText("2")).toBeInTheDocument()
    })

    // it("renders Base Currency stat tile", () => {
    //   render(<PortfolioPage />)
    //   expect(screen.getByText("Base Currency")).toBeInTheDocument()
    //   expect(screen.getByText("GBP")).toBeInTheDocument()
    // })

    it("shows loading ... for total value when loading", () => {
      mockUsePortfolio.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<PortfolioPage />)
      expect(screen.getAllByText("...")).toHaveLength(2) // totalValue + totalHoldings
    })
  })

  describe("holdings table", () => {
    it("renders Your Holdings heading", () => {
      render(<PortfolioPage />)
      expect(screen.getByText("Your Holdings")).toBeInTheDocument()
    })

    it("renders ag grid when holdings available", () => {
      render(<PortfolioPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })

    it("shows spinner when loading", () => {
      mockUsePortfolio.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<PortfolioPage />)
      expect(document.querySelector(".portfolio-spinner")).toBeInTheDocument()
    })

    it("shows empty message when no holdings", () => {
      mockUsePortfolio.mockReturnValue({ ...defaultHook, rowData: [] })
      render(<PortfolioPage />)
      expect(screen.getByText("No holdings yet")).toBeInTheDocument()
    })

    it("does not show ag grid when no holdings", () => {
      mockUsePortfolio.mockReturnValue({ ...defaultHook, rowData: [] })
      render(<PortfolioPage />)
      expect(screen.queryByTestId("ag-grid")).not.toBeInTheDocument()
    })
  })

})