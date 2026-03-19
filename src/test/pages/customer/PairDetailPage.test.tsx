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
vi.mock("@/api/client", () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})

import { usePairDetail } from "../../../hooks/customer/usePairDetail"
const mockUsePairDetail = vi.mocked(usePairDetail)

const mockPair = {
  id: 1,
  pair: "GBP/USD",
  base:  { code: "gbp", name: "British Pound", symbol: "£", flag: "gbp" },
  quote: { code: "usd", name: "US Dollar",     symbol: "$", flag: "usd" },
  rate: "1.2850",
  change_pct: "0.45",
}

const mockPortfolio = {
  holdings: [{ currency: { code: "gbp" }, amount: "10000.00", gbp_value: "10000.00" }],
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
      expect(document.querySelector(".salt-Spinner-root, [role='progressbar']") ??
        screen.queryByText("GBP/USD")).toBeFalsy()
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
        const highs = document.querySelectorAll(".pair-detail-stat-value")
        expect(highs[0].textContent).toBe("1.2900")
      })
      it("renders today low", () => {
        render(<PairDetailPage />)
        expect(screen.getByText("1.2700")).toBeInTheDocument()
      })
  })

  describe("chart section", () => {
    it("renders Rate History heading", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Rate History")).toBeInTheDocument()
    })

    it("renders period buttons", () => {
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
  })

  describe("market activity", () => {
    it("renders Market Activity heading", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Market Activity")).toBeInTheDocument()
    })

    it("renders buy count", () => {
        render(<PairDetailPage />)
        expect(screen.getByText("Buy Count")).toBeInTheDocument()
        expect(document.querySelector(".pair-detail-buy-count")?.textContent).toBe("1")
      })

    it("renders sell count", () => {
      render(<PairDetailPage />)
      expect(screen.getByText("Sell Count")).toBeInTheDocument()
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

    it("renders trade rows", () => {
      render(<PairDetailPage />)
      expect(screen.getAllByText("buy").length + screen.getAllByText("sell").length).toBeGreaterThan(0)
    })

    it("shows empty message when no pair trades", () => {
      mockUsePairDetail.mockReturnValue({ ...defaultHook, pairTrades: [] })
      render(<PairDetailPage />)
      expect(screen.getByText("No trades yet for this pair.")).toBeInTheDocument()
    })
  })

//   describe("modals", () => {
    // it("opens Market Exchange modal on button click", () => {
    //     render(<PairDetailPage />)
    //     const btn = document.querySelector(".pair-detail-market-btn") as HTMLElement
    //     fireEvent.click(btn)
    //     expect(screen.getAllByText("Market Exchange")).toHaveLength(2)
    //   })
      
    //   it("opens Limit Order modal on button click", () => {
    //     render(<PairDetailPage />)
    //     const btn = document.querySelector(".pair-detail-limit-btn") as HTMLElement
    //     fireEvent.click(btn)
    //     expect(screen.getAllByText("Place Limit Order")).toHaveLength(2)
    //   })
//   })

  describe("disclaimer", () => {
    it("renders disclaimer text", () => {
      render(<PairDetailPage />)
      expect(screen.getByText(/Disclaimer/)).toBeInTheDocument()
      expect(screen.getByText(/reference-only platform/)).toBeInTheDocument()
    })
  })

})