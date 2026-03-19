import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// All vi.mock calls must be at top with no external variables
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
vi.mock("../../../components/grids/CellRenderers", () => ({
  PairCellRenderer: () => <span>PairCell</span>,
  ChangeCellRenderer: () => <span>ChangeCell</span>,
  makeTradeActionRenderer: (navigate: any) => (params: any) => (
    <button onClick={() => navigate(`/customer/pairs/${params.data.id}`)}>Trade</button>
  ),
}))
vi.mock("../../../api/client", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})
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

// Imports after mocks
import { PairsPage, TradeModal } from "../../../pages/customer/PairsPage"
import { usePairs } from "../../../hooks/customer/usePairs"
import { apiFetch } from "../../../api/client"

const mockUsePairs = vi.mocked(usePairs)
const mockApiFetch = vi.mocked(apiFetch)

const mockPairs = [
  { id: 1, pair: "GBP/USD", base: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "USD", name: "US Dollar", symbol: "$", flag: "usd" }, rate: "1.2850", change_pct: "0.45" },
  { id: 2, pair: "GBP/EUR", base: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "EUR", name: "Euro", symbol: "€", flag: "eur" }, rate: "1.1800", change_pct: "-0.30" },
]
const mockRowData = mockPairs.map(p => ({ ...p, rate_num: parseFloat(p.rate), spread: (parseFloat(p.rate) * 0.0003).toFixed(4) }))
const defaultHook = { pairs: mockPairs, rowData: mockRowData, isLoading: false }
const mockPair = mockPairs[0]


describe("PairsPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePairs.mockReturnValue(defaultHook)
    mockApiFetch.mockResolvedValue({})
  })

  describe("rendering", () => {
    it("renders search bar", () => {
      render(<PairsPage />)
      expect(screen.getByTestId("search-bar")).toBeInTheDocument()
    })

    it("renders pairs count", () => {
      render(<PairsPage />)
      expect(document.querySelector(".pairs-count")?.textContent).toContain("2")
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

    it("renders pairs-search-wrapper", () => {
      render(<PairsPage />)
      expect(document.querySelector(".pairs-search-wrapper")).toBeInTheDocument()
    })

    it("renders pairs-card container", () => {
      render(<PairsPage />)
      expect(document.querySelector(".pairs-card")).toBeInTheDocument()
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

    it("does not show subtitle when loading", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<PairsPage />)
      expect(screen.queryByText(/Showing \d+ trading/)).not.toBeInTheDocument()
    })
  })

  describe("empty state", () => {
    it("shows empty message when no pairs found", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, pairs: [], rowData: [] })
      render(<PairsPage />)
      expect(screen.getByText(/No pairs found/)).toBeInTheDocument()
    })

    it("does not render grid when empty", () => {
      mockUsePairs.mockReturnValue({ ...defaultHook, pairs: [], rowData: [] })
      render(<PairsPage />)
      expect(screen.queryByTestId("ag-grid")).not.toBeInTheDocument()
    })
  })

  describe("search", () => {
    it("passes empty string initially", () => {
      render(<PairsPage />)
      expect(mockUsePairs).toHaveBeenCalledWith("")
    })

    it("passes search value to hook", () => {
      render(<PairsPage />)
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "gbp/usd" } })
      expect(mockUsePairs).toHaveBeenCalledWith("gbp/usd")
    })

    it("search placeholder is correct", () => {
      render(<PairsPage />)
      expect(screen.getByPlaceholderText("Search pairs (e.g., GBP/USD)...")).toBeInTheDocument()
    })
  })

  describe("modal", () => {
    it("no dialog visible initially", () => {
      render(<PairsPage />)
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument()
    })
  })
})

// TradeModal tests
describe("TradeModal", () => {

  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue({})
  })

  it("renders dialog", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByTestId("dialog")).toBeInTheDocument()
  })

  it("renders header with pair name", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByTestId("dialog-header")).toHaveTextContent("Trade GBP/USD")
  })

  it("renders current rate", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByText("1.2850")).toBeInTheDocument()
  })

  it("renders Buy GBP button active by default", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByText("Buy GBP")).toHaveClass("active")
  })

  it("renders Sell GBP button inactive by default", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByText("Sell GBP")).toHaveClass("inactive")
  })

  it("switches to sell side on click", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.click(screen.getByText("Sell GBP"))
    expect(screen.getByText("Sell GBP")).toHaveClass("active")
    expect(screen.getByText("Buy GBP")).toHaveClass("inactive")
  })

  it("renders Confirm Buy button", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    expect(screen.getByText("Confirm Buy")).toBeInTheDocument()
  })

  it("renders Confirm Sell after switching side", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.click(screen.getByText("Sell GBP"))
    expect(screen.getByText("Confirm Sell")).toBeInTheDocument()
  })

  it("calls onClose when Cancel clicked", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.click(screen.getByText("Cancel"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("shows error when submitted with empty amount", async () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.click(screen.getByText("Confirm Buy"))
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid amount")).toBeInTheDocument()
    })
  })

  it("shows summary when amount is entered", () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } })
    expect(screen.getByText(/spend/)).toBeInTheDocument()
  })

  it("calls apiFetch on valid trade", async () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } })
    fireEvent.click(screen.getByText("Confirm Buy"))
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/trades/market/",
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  it("shows success message after trade", async () => {
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } })
    fireEvent.click(screen.getByText("Confirm Buy"))
    await waitFor(() => {
      expect(screen.getByText(/Bought 100 GBP successfully!/)).toBeInTheDocument()
    })
  })

  it("shows error when apiFetch fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Trade failed"))
    render(<TradeModal pair={mockPair} onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } })
    fireEvent.click(screen.getByText("Confirm Buy"))
    await waitFor(() => {
      expect(screen.getByText("Trade failed")).toBeInTheDocument()
    })
  })
})