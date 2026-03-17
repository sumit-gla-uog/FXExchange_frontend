import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PairsPage } from "../../../pages/customer/PairsPage"

vi.mock("../../../hooks/customer/usePairs", () => ({ usePairs: vi.fn() }))
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }))
vi.mock("ag-grid-react", () => ({ AgGridReact: () => <div data-testid="ag-grid" /> }))
vi.mock("../../../components/ui/CurrencySearchBar", () => ({
  CurrencySearchBar: ({ value, onChange, placeholder, subtitle }: any) => (
    <div data-testid="search-bar">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {subtitle && <span>{subtitle}</span>}
    </div>
  ),
}))
vi.mock("@/api/client", () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})

import { usePairs } from "../../../hooks/customer/usePairs"
const mockUsePairs = vi.mocked(usePairs)

const mockPairs = [
  { id: 1, pair: "GBP/USD", base: { code: "gbp", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "usd", name: "US Dollar", symbol: "$", flag: "usd" }, rate: "1.2850", change_pct: "0.45" },
  { id: 2, pair: "GBP/EUR", base: { code: "gbp", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "eur", name: "Euro",       symbol: "€", flag: "eur" }, rate: "1.1800", change_pct: "-0.30" },
]

const mockRowData = mockPairs.map(p => ({ ...p, rate_num: parseFloat(p.rate), spread: (parseFloat(p.rate) * 0.0003).toFixed(4) }))

const defaultHook = { pairs: mockPairs, rowData: mockRowData, isLoading: false }

describe("PairsPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePairs.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders search bar", () => {
      render(<PairsPage />)
      expect(screen.getByTestId("search-bar")).toBeInTheDocument()
    })

    it("renders pairs count", () => {
        render(<PairsPage />)
        const countDiv = document.querySelector(".pairs-count")
        expect(countDiv?.textContent).toBe("Showing 2 trading pairs")
      })

    it("renders ag grid when pairs available", () => {
      render(<PairsPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })

    it("shows subtitle with pair count", () => {
      render(<PairsPage />)
      expect(screen.getByText("Showing 2 trading pairs")).toBeInTheDocument()
    })

    it("shows singular pair text for 1 result", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, pairs: [mockPairs[0]], rowData: [mockRowData[0]] })
      render(<PairsPage />)
      expect(screen.getByText("Showing 1 trading pair")).toBeInTheDocument()
    })
  })

  describe("loading state", () => {
    it("shows spinner when loading", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<PairsPage />)
      expect(document.querySelector(".pairs-spinner")).toBeInTheDocument()
    })

    it("does not render grid when loading", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<PairsPage />)
      expect(screen.queryByTestId("ag-grid")).not.toBeInTheDocument()
    })
  })

  describe("empty state", () => {
    it("shows empty message when no pairs found", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, pairs: [], rowData: [] })
      render(<PairsPage />)
      expect(screen.getByText(/No pairs found/)).toBeInTheDocument()
    })
  })

  describe("search", () => {
    it("passes search value to hook", () => {
      render(<PairsPage />)
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "gbp/usd" } })
      expect(mockUsePairs).toHaveBeenCalledWith("gbp/usd")
    })
  })

})