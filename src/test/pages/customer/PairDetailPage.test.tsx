import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PairDetailPage } from "../../../pages/customer/PairDetailPage"

vi.mock("../../../hooks/customer/usePairDetail", () => ({ usePairDetail: vi.fn() }))
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "1" }),
}))
vi.mock("highcharts-react-official", () => ({
  default: () => <div data-testid="highcharts" />,
}))
vi.mock("highcharts", () => ({ default: {} }))
vi.mock("../../../api/client", () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})
vi.mock("../../../components/ui/CurrencyFlag", () => ({
  CurrencyFlag: ({ code }: { code: string }) => (
    <span data-testid="currency-flag">{code}</span>
  ),
}))

// Mock Salt DS Dialog — renders children when open=true
vi.mock("@salt-ds/core", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    Dialog: ({ children, open }: any) =>
      open ? <div data-testid="dialog">{children}</div> : null,
    DialogHeader: ({ header }: any) =>
      <div data-testid="dialog-header">{header}</div>,
    DialogContent: ({ children }: any) =>
      <div data-testid="dialog-content">{children}</div>,
    DialogActions: ({ children }: any) =>
      <div data-testid="dialog-actions">{children}</div>,
  }
})

import { usePairDetail } from "../../../hooks/customer/usePairDetail"
const mockUsePairDetail = vi.mocked(usePairDetail)

const mockPair = {
  id: 1,
  pair: "GBP/USD",
  base:  { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" },
  quote: { code: "USD", name: "US Dollar",     symbol: "$", flag: "usd" },
  rate: "1.2850",
  change_pct: "0.45",
}

const mockPortfolio = {
  holdings: [{ currency: { code: "GBP" }, amount: "10000.00", gbp_value: "10000.00" }],
  total_value_gbp: "10000.00",
}

const defaultHook = {
  pair: mockPair,
  portfolio: mockPortfolio,
  pairTrades: [
    { id: 1, pair: "GBP/USD", side: "buy",  amount: "1000", rate: "1.285", total: "1285", executed_at: "2026-03-17T10:00:00Z" },
    { id: 2, pair: "GBP/USD", side: "sell", amount: "500",  rate: "1.290", total: "645",  executed_at: "2026-03-16T10:00:00Z" },
  ],
  buyCount: 1,
  sellCount: 1,
  totalVolume: 1500,
  history: [{ rate: "1.2800", recorded_at: "2026-03-17T08:00:00Z" }],
  chartData: [[1710662400000, 1.28]],
  todayHigh: 1.29,
  todayLow: 1.27,
  loadingPair: false,
  loadingHistory: false,
}

describe("PairDetailPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePairDetail.mockReturnValue(defaultHook)
  })

  describe("loading state", () => {
    it("shows spinner when pair is loading", () => {
      mockUsePairDetail.mockReturnValue({ ...defaultHook, pair: undefined, loadingPair: true })
      render(<PairDetailPage />)
      expect(screen.queryByText("Pair not found.")).not.toBeInTheDocument()
    })

    it("shows not found message when pair is undefined and not loading", () => {
      mockUsePairDetail.mockReturnValue({ ...defaultHook, pair: undefined, loadingPair: false })
      render(<PairDetailPage />)
      expect(screen.getByText("Pair not found.")).toBeInTheDocument()
    })
  })

  describe("pair header", () => {
    it("renders Back button", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Back")).toBeInTheDocument()
    })

    it("renders Market Exchange button", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Market Exchange")).toBeInTheDocument()
    })

    it("renders Place Limit Order button", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Place Limit Order")).toBeInTheDocument()
    })
  })

  describe("rate card", () => {
    it("renders current rate", () => {
      render(<PairDetailPage />)
      expect(screen.getAllByText("1.2850")[0]).toBeInTheDocument()
    })

    it("renders today high", () => {
      render(<PairDetailPage />)
      const statValues = document.querySelectorAll(".pair-detail-stat-value")
      expect(statValues[0].textContent).toBe("1.2900")
    })

    it("renders today low", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("1.2700")).toBeInTheDocument()
    })

    it("renders rate sub label with base and quote codes", () => {
      render(<PairDetailPage />)
      expect(screen.getByText(/1 GBP = 1.2850 USD/)).toBeInTheDocument()
    })
  })

  describe("chart section", () => {
    it("renders Rate History heading", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Rate History")).toBeInTheDocument()
    })

    it("renders all period buttons", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("1h")).toBeInTheDocument()
      expect(screen.getByText("1d")).toBeInTheDocument()
      expect(screen.getByText("1w")).toBeInTheDocument()
      expect(screen.getByText("1m")).toBeInTheDocument()
    })

    it("renders highcharts when history available", () => {
      render(<PairDetailPage />)
      expect(screen.getByTestId("highcharts")).toBeInTheDocument()
    })

    it("shows no history message when history is empty", () => {
      mockUsePairDetail.mockReturnValue({ ...defaultHook, history: [], chartData: [] })
      render(<PairDetailPage />)
      expect(screen.getByText("No history data available")).toBeInTheDocument()
    })

    it("changes period on button click", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("1w"))
      expect(screen.getByText("1w")).toHaveClass("active")
    })

    it("1d is active by default", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("1d")).toHaveClass("active")
    })

    it("changes active period from 1d to 1m", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("1m"))
      expect(screen.getByText("1m")).toHaveClass("active")
      expect(screen.getByText("1d")).not.toHaveClass("active")
    })
  })

  describe("market activity", () => {
    it("renders Market Activity heading", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Market Activity")).toBeInTheDocument()
    })

    it("renders Buy Count label", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Buy Count")).toBeInTheDocument()
    })

    it("renders buy count value", () => {
      render(<PairDetailPage />)
      expect(document.querySelector(".pair-detail-buy-count")?.textContent).toBe("1")
    })

    it("renders Sell Count label", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Sell Count")).toBeInTheDocument()
    })

    it("renders sell count element", () => {
      render(<PairDetailPage />)
      expect(document.querySelector(".pair-detail-sell-count")).toBeInTheDocument()
    })

    it("renders total volume", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Total Volume")).toBeInTheDocument()
      expect(screen.getByText("1,500")).toBeInTheDocument()
    })
  })

  describe("recent trades", () => {
    it("renders Recent Trades heading", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Recent Trades")).toBeInTheDocument()
    })

    it("renders trade rows with buy/sell sides", () => {
      render(<PairDetailPage />)
      expect(
        screen.getAllByText("buy").length + screen.getAllByText("sell").length
      ).toBeGreaterThan(0)
    })

    it("shows empty message when no pair trades", () => {
      mockUsePairDetail.mockReturnValue({ ...defaultHook, pairTrades: [] })
      render(<PairDetailPage />)
      expect(screen.getByText("No trades yet for this pair.")).toBeInTheDocument()
    })

    it("renders table headers", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Amount")).toBeInTheDocument()
      expect(screen.getByText("Rate")).toBeInTheDocument()
      expect(screen.getByText("Total")).toBeInTheDocument()
    })

    it("renders trade amount", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("1,000")).toBeInTheDocument()
    })
  })

  describe("modals", () => {
    it("no dialog visible initially", () => {
      render(<PairDetailPage />)
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument()
    })

    it("opens Market Exchange modal on button click", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Market Exchange"))
      expect(screen.getByTestId("dialog")).toBeInTheDocument()
    })

    it("market modal header is Market Exchange", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Market Exchange"))
      expect(screen.getByTestId("dialog-header")).toHaveTextContent("Market Exchange")
    })

    it("market modal shows Execute Market Order button", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Market Exchange"))
      expect(screen.getByText("Execute Market Order")).toBeInTheDocument()
    })

    it("market modal shows Cancel button", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Market Exchange"))
      expect(screen.getByText("Cancel")).toBeInTheDocument()
    })

    it("market modal shows rate info", () => {
        render(<PairDetailPage />)
        fireEvent.click(screen.getByText("Market Exchange"))
        expect(document.querySelector(".modal-rate-value")).toBeInTheDocument()
        expect(document.querySelector(".modal-rate-box")).toBeInTheDocument()
      })

    it("market modal shows Available label", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Market Exchange"))
      expect(screen.getByText(/Available:/)).toBeInTheDocument()
    })

    it("opens Limit Order modal on button click", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Place Limit Order"))
      expect(screen.getByTestId("dialog")).toBeInTheDocument()
    })

    it("limit modal header is Place Limit Order", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Place Limit Order"))
      expect(screen.getByTestId("dialog-header")).toHaveTextContent("Place Limit Order")
    })

    it("limit modal shows Target Rate label", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Place Limit Order"))
      expect(screen.getByText(/Target Rate/)).toBeInTheDocument()
    })

    it("limit modal shows Cancel button", () => {
      render(<PairDetailPage />)
      fireEvent.click(screen.getByText("Place Limit Order"))
      expect(screen.getByText("Cancel")).toBeInTheDocument()
    })
  })

  describe("disclaimer", () => {
    it("renders disclaimer text", () => {
      render(<PairDetailPage />)
      expect(screen.getByText(/Disclaimer/)).toBeInTheDocument()
      expect(screen.getByText(/reference-only platform/)).toBeInTheDocument()
    })
  })

})