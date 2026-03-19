import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import {
  CurrencyCellRenderer,
  PairCellRenderer,
  ChangeCellRenderer,
  StatusBadge,
  StatusBadgeCellRenderer,
  CancelButtonCell,
  makeTradeActionRenderer,
  makePortfolioTradeRenderer,
} from "../../../components/grids/CellRenderers"
import type { ICellRendererParams } from "ag-grid-community"

// Mock CurrencyFlag so tests don't depend on @salt-ds/countries
vi.mock("../../../components/ui/CurrencyFlag", () => ({
  CurrencyFlag: ({ code }: { code: string }) => (
    <span data-testid="currency-flag">{code}</span>
  ),
}))

// Mock apiFetch and mutate
vi.mock("../../../api/client", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}))

vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})

// Helper to build minimal ICellRendererParams
const makeParams = (overrides: Record<string, any> = {}): ICellRendererParams => ({
  value: overrides.value ?? "test",
  data: overrides.data ?? {},
  node: {} as any,
  colDef: {} as any,
  column: {} as any,
  api: {} as any,
  context: {},
  eGridCell: document.createElement("div"),
  eParentOfValue: document.createElement("div"),
  getValue: vi.fn(),
  setValue: vi.fn(),
  formatValue: vi.fn(),
  refreshCell: vi.fn(),
  ...overrides,
}) as unknown as ICellRendererParams

// CurrencyCellRenderer
describe("CurrencyCellRenderer", () => {
  it("renders currency flag via CurrencyFlag component", () => {
    render(<CurrencyCellRenderer {...makeParams({ data: { currency: { code: "USD", name: "US Dollar" } } })} />)
    expect(screen.getByTestId("currency-flag")).toBeInTheDocument()
    expect(screen.getByTestId("currency-flag")).toHaveTextContent("USD")
  })

  it("renders currency code", () => {
    const { container } = render(<CurrencyCellRenderer {...makeParams({ data: { currency: { code: "USD", name: "US Dollar" } } })} />)
    const codeEl = container.querySelector(".code")
    expect(codeEl).toHaveTextContent("USD")
  })

  it("renders currency name", () => {
    render(<CurrencyCellRenderer {...makeParams({ data: { currency: { code: "USD", name: "US Dollar" } } })} />)
    expect(screen.getByText("US Dollar")).toBeInTheDocument()
  })

  it("applies cell-currency class", () => {
    const { container } = render(<CurrencyCellRenderer {...makeParams({ data: { currency: { code: "USD", name: "US Dollar" } } })} />)
    expect(container.firstChild).toHaveClass("cell-currency")
  })
})

// PairCellRenderer
describe("PairCellRenderer", () => {
  const pairData = { pair: "GBP/USD", quote: { code: "USD", name: "US Dollar" } }

  it("renders quote flag via CurrencyFlag component", () => {
    render(<PairCellRenderer {...makeParams({ data: pairData })} />)
    expect(screen.getByTestId("currency-flag")).toBeInTheDocument()
    expect(screen.getByTestId("currency-flag")).toHaveTextContent("USD")
  })

  it("renders pair string", () => {
    render(<PairCellRenderer {...makeParams({ data: pairData })} />)
    expect(screen.getByText("GBP/USD")).toBeInTheDocument()
  })

  it("renders quote currency name", () => {
    render(<PairCellRenderer {...makeParams({ data: pairData })} />)
    expect(screen.getByText("US Dollar")).toBeInTheDocument()
  })

  it("applies cell-pair class", () => {
    const { container } = render(<PairCellRenderer {...makeParams({ data: pairData })} />)
    expect(container.firstChild).toHaveClass("cell-pair")
  })
})

// ChangeCellRenderer
describe("ChangeCellRenderer", () => {
  it("renders positive change with ↗", () => {
    render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "1.25" } })} />)
    expect(screen.getByText(/↗ \+1\.25%/)).toBeInTheDocument()
  })

  it("renders negative change with ↘", () => {
    render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "-2.50" } })} />)
    expect(screen.getByText(/↘ -2\.50%/)).toBeInTheDocument()
  })

  it("renders — when change_pct is NaN", () => {
    render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "invalid" } })} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("applies positive class for positive change", () => {
    const { container } = render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "1.25" } })} />)
    expect(container.firstChild).toHaveClass("positive")
  })

  it("applies negative class for negative change", () => {
    const { container } = render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "-1.25" } })} />)
    expect(container.firstChild).toHaveClass("negative")
  })

  it("applies empty class for NaN", () => {
    const { container } = render(<ChangeCellRenderer {...makeParams({ data: { change_pct: "invalid" } })} />)
    expect(container.firstChild).toHaveClass("empty")
  })
})

// StatusBadge
describe("StatusBadge", () => {
  it("renders the value", () => {
    render(<StatusBadge value="open" />)
    expect(screen.getByText("open")).toBeInTheDocument()
  })

  it("applies cell-status-badge class", () => {
    const { container } = render(<StatusBadge value="open" />)
    expect(container.firstChild).toHaveClass("cell-status-badge")
  })

  it("applies correct bg color for open", () => {
    const { container } = render(<StatusBadge value="open" />)
    expect(container.firstChild).toHaveStyle({ background: "#fef9c3" })
  })

  it("applies correct bg color for filled", () => {
    const { container } = render(<StatusBadge value="filled" />)
    expect(container.firstChild).toHaveStyle({ background: "#dcfce7" })
  })

  it("applies correct bg color for cancelled", () => {
    const { container } = render(<StatusBadge value="cancelled" />)
    expect(container.firstChild).toHaveStyle({ background: "#fee2e2" })
  })

  it("falls back to grey for unknown status", () => {
    const { container } = render(<StatusBadge value="unknown" />)
    expect(container.firstChild).toHaveStyle({ background: "#f3f4f6" })
  })
})

// StatusBadgeCellRenderer
describe("StatusBadgeCellRenderer", () => {
  it("renders value from cell params", () => {
    render(<StatusBadgeCellRenderer {...makeParams({ value: "filled" })} />)
    expect(screen.getByText("filled")).toBeInTheDocument()
  })
})

// CancelButtonCell
describe("CancelButtonCell", () => {
  it("renders Cancel button for open orders", () => {
    render(<CancelButtonCell {...makeParams({ data: { id: 1, status: "open" } })} />)
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("renders nothing for filled orders", () => {
    const { container } = render(<CancelButtonCell {...makeParams({ data: { id: 1, status: "filled" } })} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing for cancelled orders", () => {
    const { container } = render(<CancelButtonCell {...makeParams({ data: { id: 1, status: "cancelled" } })} />)
    expect(container.firstChild).toBeNull()
  })

  it("calls apiFetch on cancel click", async () => {
    const { apiFetch } = await import("../../../api/client")
    render(<CancelButtonCell {...makeParams({ data: { id: 42, status: "open" } })} />)
    fireEvent.click(screen.getByText("Cancel"))
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/orders/42/cancel/", expect.objectContaining({ method: "POST" }))
  })

  it("shows loading state while cancelling", async () => {
    const { apiFetch } = await import("../../../api/client")
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))
    render(<CancelButtonCell {...makeParams({ data: { id: 1, status: "open" } })} />)
    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.getByText("...")).toBeInTheDocument()
  })
})

// makeTradeActionRenderer
describe("makeTradeActionRenderer", () => {
  it("renders Trade button", () => {
    const navigate = vi.fn()
    const Renderer = makeTradeActionRenderer(navigate)
    render(<Renderer {...makeParams({ data: { id: 5 } })} />)
    expect(screen.getByText("Trade")).toBeInTheDocument()
  })

  it("navigates to pair detail on click", () => {
    const navigate = vi.fn()
    const Renderer = makeTradeActionRenderer(navigate)
    render(<Renderer {...makeParams({ data: { id: 5 } })} />)
    fireEvent.click(screen.getByText("Trade"))
    expect(navigate).toHaveBeenCalledWith("/customer/pairs/5")
  })

  it("applies cell-action class", () => {
    const navigate = vi.fn()
    const Renderer = makeTradeActionRenderer(navigate)
    const { container } = render(<Renderer {...makeParams({ data: { id: 5 } })} />)
    expect(container.firstChild).toHaveClass("cell-action")
  })
})

// makePortfolioTradeRenderer
describe("makePortfolioTradeRenderer", () => {
  it("renders Trade button", () => {
    const navigate = vi.fn()
    const Renderer = makePortfolioTradeRenderer(navigate)
    render(<Renderer {...makeParams()} />)
    expect(screen.getByText("Trade")).toBeInTheDocument()
  })

  it("navigates to pairs list on click", () => {
    const navigate = vi.fn()
    const Renderer = makePortfolioTradeRenderer(navigate)
    render(<Renderer {...makeParams()} />)
    fireEvent.click(screen.getByText("Trade"))
    expect(navigate).toHaveBeenCalledWith("/customer/pairs")
  })
})