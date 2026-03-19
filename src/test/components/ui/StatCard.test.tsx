import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StatCard } from "../../../components/ui/StatCard"

describe("StatCard", () => {

  describe("rendering", () => {
    it("renders the label", () => {
      render(<StatCard label="Portfolio Value" />)
      expect(screen.getByText("Portfolio Value")).toBeInTheDocument()
    })

    it("renders the value", () => {
      render(<StatCard label="Total" value="24,477.80" />)
      expect(screen.getByText("24,477.80")).toBeInTheDocument()
    })

    it("renders the sub text", () => {
      render(<StatCard label="Total" value="100" sub="GBP" />)
      expect(screen.getByText("GBP")).toBeInTheDocument()
    })

    it("does not render sub when not provided", () => {
      render(<StatCard label="Total" value="100" />)
      expect(screen.queryByText("GBP")).not.toBeInTheDocument()
    })

    it("renders numeric value", () => {
      render(<StatCard label="Count" value={42} />)
      expect(screen.getByText("42")).toBeInTheDocument()
    })

    it("renders children instead of value when provided", () => {
      render(
        <StatCard label="API Status">
          <span data-testid="custom-child">Online</span>
        </StatCard>
      )
      expect(screen.getByTestId("custom-child")).toBeInTheDocument()
      expect(screen.getByText("Online")).toBeInTheDocument()
    })

    it("does not render value when children are provided", () => {
      render(
        <StatCard label="API Status" value="should not show">
          <span>Custom Content</span>
        </StatCard>
      )
      expect(screen.queryByText("should not show")).not.toBeInTheDocument()
    })
  })

  describe("subColor", () => {
    it("applies subColor style to sub text", () => {
      render(<StatCard label="Stale" value="9" sub="Need attention" subColor="#f59e0b" />)
      const sub = screen.getByText("Need attention")
      expect(sub).toHaveStyle({ color: "#f59e0b" })
    })

    it("falls back to default color when subColor not provided", () => {
      render(<StatCard label="Total" value="0" sub="GBP" />)
      const sub = screen.getByText("GBP")
      expect(sub).toHaveStyle({ color: "#6b7280" })
    })
  })

  describe("onClick", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn()
      render(<StatCard label="Portfolio" value="100" onClick={handleClick} />)
      fireEvent.click(screen.getByText("Portfolio").closest(".stat-card")!)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("adds clickable class when onClick is provided", () => {
      const { container } = render(<StatCard label="Total" value="100" onClick={vi.fn()} />)
      expect(container.firstChild).toHaveClass("clickable")
    })

    it("does not add clickable class without onClick", () => {
      const { container } = render(<StatCard label="Total" value="100" />)
      expect(container.firstChild).not.toHaveClass("clickable")
    })
  })

  describe("className", () => {
    it("applies custom className alongside base classes", () => {
      const { container } = render(<StatCard label="Total" className="my-custom" />)
      expect(container.firstChild).toHaveClass("stat-card")
      expect(container.firstChild).toHaveClass("my-custom")
    })
  })

})