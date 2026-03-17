import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CurrenciesPage } from "../../../pages/customer/CurrenciesPage"

vi.mock("../../../hooks/customer/useCurrencies", () => ({ useCurrencies: vi.fn() }))
vi.mock("../../../components/ui/CurrencyCard", () => ({
  CurrencyCard: ({ data }: any) => <div data-testid="currency-card"><span>{data.code}</span></div>,
}))
vi.mock("../../../components/ui/CurrencySearchBar", () => ({
  CurrencySearchBar: ({ value, onChange, placeholder, subtitle }: any) => (
    <div data-testid="search-bar">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {subtitle && <span>{subtitle}</span>}
    </div>
  ),
}))

import { useCurrencies } from "../../../hooks/customer/useCurrencies"
const mockUseCurrencies = vi.mocked(useCurrencies)

const mockCurrencies = [
  { id: 1, code: "usd", name: "US Dollar",  symbol: "$", flag: "usd", enabled: true },
  { id: 2, code: "eur", name: "Euro",        symbol: "€", flag: "eur", enabled: true },
  { id: 3, code: "jpy", name: "Japanese Yen",symbol: "¥", flag: "jpy", enabled: true },
]

const mockSnapshot = {
  market_snapshot: [
    { pair: "GBP/USD", rate: "1.2850", change_pct: "0.45" },
  ],
}

const getRateInfo = vi.fn().mockReturnValue({ rate: "1.2850", change_pct: "0.45" })

const defaultHook = {
  currencies: mockCurrencies,
  snapshot: mockSnapshot,
  isLoading: false,
  getRateInfo,
}

describe("CurrenciesPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCurrencies.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders page title", () => {
      render(<CurrenciesPage />)
      expect(screen.getByText("All Currencies")).toBeInTheDocument()
    })

    it("renders search bar", () => {
      render(<CurrenciesPage />)
      expect(screen.getByTestId("search-bar")).toBeInTheDocument()
    })

    it("renders currency cards for each currency", () => {
      render(<CurrenciesPage />)
      expect(screen.getAllByTestId("currency-card")).toHaveLength(3)
    })

    it("renders correct currency codes", () => {
      render(<CurrenciesPage />)
      expect(screen.getByText("usd")).toBeInTheDocument()
      expect(screen.getByText("eur")).toBeInTheDocument()
      expect(screen.getByText("jpy")).toBeInTheDocument()
    })

    // it("shows count in subtitle", () => {
    //   render(<CurrenciesPage />)
    //   expect(screen.getByText("Showing 3 currencies")).toBeInTheDocument()
    // })

    it("shows singular currency text for 1 result", () => {
      mockUseCurrencies.mockReturnValue({ ...defaultHook, currencies: [mockCurrencies[0]] })
      render(<CurrenciesPage />)
      expect(screen.getAllByText("Showing 1 currency")).toHaveLength(2)
    })
  })

  describe("loading state", () => {
    it("shows spinner when loading", () => {
      mockUseCurrencies.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<CurrenciesPage />)
      expect(document.querySelector(".currencies-spinner")).toBeInTheDocument()
    })

    it("does not render currency cards when loading", () => {
      mockUseCurrencies.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<CurrenciesPage />)
      expect(screen.queryAllByTestId("currency-card")).toHaveLength(0)
    })
  })

  describe("empty state", () => {
    it("shows empty message when no currencies found", () => {
      mockUseCurrencies.mockReturnValue({ ...defaultHook, currencies: [] })
      render(<CurrenciesPage />)
      expect(screen.getByText(/No currencies found/)).toBeInTheDocument()
    })

    it("does not show empty message when currencies exist", () => {
      render(<CurrenciesPage />)
      expect(screen.queryByText(/No currencies found/)).not.toBeInTheDocument()
    })
  })

  describe("search", () => {
    it("passes search value to hook", () => {
      render(<CurrenciesPage />)
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "usd" } })
      expect(mockUseCurrencies).toHaveBeenCalledWith("usd")
    })

    it("calls getRateInfo for each currency", () => {
      render(<CurrenciesPage />)
      expect(getRateInfo).toHaveBeenCalledTimes(3)
    })
  })

})