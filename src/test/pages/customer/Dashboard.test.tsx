import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DashboardPage } from "../../../pages/customer/DashBoard"

vi.mock("../../../hooks/customer/useDashboard", () => ({ useDashboard: vi.fn() }))
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }))
vi.mock("../../../components/ui/StatCard", () => ({
  StatCard: ({ label, value, sub, children }: any) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      {value !== undefined && <span>{value}</span>}
      {sub && <span>{sub}</span>}
      {children}
    </div>
  ),
}))
vi.mock("../../../components/ui/CurrencyCard", () => ({
  CurrencyCard: ({ data }: any) => <div data-testid="currency-card"><span>{data.code}</span></div>,
}))

import { useDashboard } from "../../../hooks/customer/useDashboard"
const mockUseDashboard = vi.mocked(useDashboard)

const defaultHook = {
  summary: { portfolio_value_gbp: "24477.80", num_currencies: 5, change_24h_pct: "1.2", change_24h_gbp: "300" },
  snapshot: { market_snapshot: [
    { pair: "GBP/USD", base_flag: "gbp", quote_flag: "usd", rate: "1.2850", change_pct: "0.45" },
    { pair: "GBP/EUR", base_flag: "gbp", quote_flag: "eur", rate: "1.1800", change_pct: "-0.30" },
  ]},
  portfolio: { holdings: [], total_value_gbp: "24477.80" },
  gbpHolding: { currency: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, amount: "10000.00", avg_buy_rate: "1", gbp_value: "10000.00" },
  openOrders: 3,
  isApiOnline: true,
  loadingSummary: false,
  loadingSnapshot: false,
}

describe("DashboardPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDashboard.mockReturnValue(defaultHook)
  })

  describe("stat cards", () => {
    it("renders Portfolio Value stat card", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Portfolio Value")).toBeInTheDocument()
    })

    it("renders GBP Balance stat card", () => {
      render(<DashboardPage />)
      expect(screen.getByText("GBP Balance")).toBeInTheDocument()
    })

    it("renders Open Orders stat card", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Open Orders")).toBeInTheDocument()
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("renders API Status stat card", () => {
      render(<DashboardPage />)
      expect(screen.getByText("API Status")).toBeInTheDocument()
    })

    it("shows Online when api is online", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Online")).toBeInTheDocument()
    })

    it("shows Offline when api is offline", () => {
      mockUseDashboard.mockReturnValue({ ...defaultHook, isApiOnline: false })
      render(<DashboardPage />)
      expect(screen.getByText("Offline")).toBeInTheDocument()
    })

    it("renders 4 stat cards total", () => {
      render(<DashboardPage />)
      expect(screen.getAllByTestId("stat-card")).toHaveLength(4)
    })

    it("shows loading value when summary loading", () => {
      mockUseDashboard.mockReturnValue({ ...defaultHook, loadingSummary: true, summary: undefined })
      render(<DashboardPage />)
      expect(screen.getByText("...")).toBeInTheDocument()
    })
  })

  describe("market snapshot", () => {
    it("renders Market Snapshot heading", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Market Snapshot")).toBeInTheDocument()
    })

    it("renders currency cards for each snapshot item", () => {
      render(<DashboardPage />)
      expect(screen.getAllByTestId("currency-card")).toHaveLength(2)
    })

    it("renders correct currency codes from snapshot", () => {
      render(<DashboardPage />)
      expect(screen.getByText("USD")).toBeInTheDocument()
      expect(screen.getByText("EUR")).toBeInTheDocument()
    })

    it("shows spinner when snapshot loading", () => {
      mockUseDashboard.mockReturnValue({ ...defaultHook, loadingSnapshot: true, snapshot: undefined })
      render(<DashboardPage />)
      expect(screen.queryAllByTestId("currency-card")).toHaveLength(0)
    })

    it("renders View All button", () => {
      render(<DashboardPage />)
      expect(screen.getByText("View All")).toBeInTheDocument()
    })
  })

  describe("quick actions", () => {
    it("renders Quick Actions section", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Quick Actions")).toBeInTheDocument()
    })

    it("renders Browse Currencies button", () => {
      render(<DashboardPage />)
      expect(screen.getByText("Browse Currencies")).toBeInTheDocument()
    })

    it("renders View Trading Pairs button", () => {
      render(<DashboardPage />)
      expect(screen.getByText("View Trading Pairs")).toBeInTheDocument()
    })

    it("renders New Trade button", () => {
      render(<DashboardPage />)
      expect(screen.getByText("New Trade")).toBeInTheDocument()
    })

    // it("navigates to currencies on Browse Currencies click", () => {
    //   const navigate = vi.fn()
    //   vi.mocked(require("react-router-dom").useNavigate).mockReturnValue(navigate)
    //   render(<DashboardPage />)
    //   fireEvent.click(screen.getByText("Browse Currencies"))
    //   expect(navigate).toHaveBeenCalledWith("/customer/currencies")
    // })
  })

})