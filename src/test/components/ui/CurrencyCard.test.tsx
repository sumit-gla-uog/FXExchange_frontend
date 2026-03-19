import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CurrencyCard } from "../../../components/ui/CurrencyCard"
import type { CurrencyCardData } from "../../../components/ui/CurrencyCard"

// Mock CurrencyFlag so tests don't depend on @salt-ds/countries
vi.mock("../../../components/ui/CurrencyFlag", () => ({
  CurrencyFlag: ({ code }: { code: string }) => (
    <span data-testid="currency-flag">{code}</span>
  ),
}))

const baseData: CurrencyCardData = {
  code: "USD",
  name: "US Dollar",
  rate: 1.2850,
  changePct: 0.45,
}

describe("CurrencyCard", () => {

  describe("compact variant", () => {
    it("renders currency code", () => {
      render(<CurrencyCard variant="compact" data={baseData} />)
      const codeEl = screen.getAllByText("USD")
      expect(codeEl.length).toBeGreaterThan(0)
    })

    it("renders flag via CurrencyFlag component", () => {
      render(<CurrencyCard variant="compact" data={baseData} />)
      expect(screen.getByTestId("currency-flag")).toBeInTheDocument()
      expect(screen.getByTestId("currency-flag")).toHaveTextContent("USD")
    })

    it("renders formatted rate", () => {
      render(<CurrencyCard variant="compact" data={baseData} />)
      expect(screen.getByText("1.2850")).toBeInTheDocument()
    })

    it("renders positive change with ↗", () => {
      render(<CurrencyCard variant="compact" data={baseData} />)
      expect(screen.getByText(/↗ \+0\.45%/)).toBeInTheDocument()
    })

    it("renders negative change with ↘", () => {
      render(<CurrencyCard variant="compact" data={{ ...baseData, changePct: -1.23 }} />)
      expect(screen.getByText(/↘ -1\.23%/)).toBeInTheDocument()
    })

    it("renders — when rate is null", () => {
      render(<CurrencyCard variant="compact" data={{ ...baseData, rate: null }} />)
      expect(screen.getByText("—")).toBeInTheDocument()
    })

    it("does not render change when changePct is null", () => {
      render(<CurrencyCard variant="compact" data={{ ...baseData, changePct: null }} />)
      expect(screen.queryByText(/↗/)).not.toBeInTheDocument()
    })

    it("applies currency-card-compact class", () => {
      const { container } = render(<CurrencyCard variant="compact" data={baseData} />)
      expect(container.firstChild).toHaveClass("currency-card-compact")
    })

    it("adds clickable class when onClick provided", () => {
      const { container } = render(<CurrencyCard variant="compact" data={baseData} onClick={vi.fn()} />)
      expect(container.firstChild).toHaveClass("clickable")
    })

    it("calls onClick when clicked", () => {
      const handleClick = vi.fn()
      render(<CurrencyCard variant="compact" data={baseData} onClick={handleClick} />)
      fireEvent.click(screen.getAllByText("USD")[0])
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("full variant", () => {
    it("renders currency code", () => {
      render(<CurrencyCard variant="full" data={baseData} />)
      const codeEl = screen.getAllByText("USD")
      expect(codeEl.length).toBeGreaterThan(0)
    })

    it("renders flag via CurrencyFlag component", () => {
      render(<CurrencyCard variant="full" data={baseData} />)
      expect(screen.getByTestId("currency-flag")).toBeInTheDocument()
      expect(screen.getByTestId("currency-flag")).toHaveTextContent("USD")
    })

    it("renders currency name", () => {
      render(<CurrencyCard variant="full" data={baseData} />)
      expect(screen.getByText("US Dollar")).toBeInTheDocument()
    })

    it("does not render name when not provided", () => {
      render(<CurrencyCard variant="full" data={{ ...baseData, name: undefined }} />)
      expect(screen.queryByText("US Dollar")).not.toBeInTheDocument()
    })

    it("renders Base Currency label when isBase is true", () => {
      render(<CurrencyCard variant="full" data={{ ...baseData, isBase: true }} />)
      expect(screen.getByText("Base Currency")).toBeInTheDocument()
    })

    it("renders rate info when not base currency", () => {
      render(<CurrencyCard variant="full" data={baseData} />)
      expect(screen.getByText("1.2850")).toBeInTheDocument()
    })

    it("renders No rate available when rate is null and not base", () => {
      render(<CurrencyCard variant="full" data={{ ...baseData, rate: null }} />)
      expect(screen.getByText("No rate available")).toBeInTheDocument()
    })

    it("applies currency-card-full class", () => {
      const { container } = render(<CurrencyCard variant="full" data={baseData} />)
      expect(container.firstChild).toHaveClass("currency-card-full")
    })

    it("defaults to full variant", () => {
      const { container } = render(<CurrencyCard data={baseData} />)
      expect(container.firstChild).toHaveClass("currency-card-full")
    })
  })

  describe("hover state", () => {
    it("adds hovered class on mouse enter", () => {
      const { container } = render(<CurrencyCard variant="compact" data={baseData} />)
      fireEvent.mouseEnter(container.firstChild!)
      expect(container.firstChild).toHaveClass("hovered")
    })

    it("removes hovered class on mouse leave", () => {
      const { container } = render(<CurrencyCard variant="compact" data={baseData} />)
      fireEvent.mouseEnter(container.firstChild!)
      fireEvent.mouseLeave(container.firstChild!)
      expect(container.firstChild).not.toHaveClass("hovered")
    })
  })

})