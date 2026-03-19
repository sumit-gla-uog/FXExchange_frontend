import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TabBtn } from "../../../components/ui/TabBtn"

describe("TabBtn", () => {

  const defaultProps = {
    label: "All",
    count: 10,
    active: false,
    onClick: vi.fn(),
  }

  describe("rendering", () => {
    it("renders label and count", () => {
      render(<TabBtn {...defaultProps} />)
      expect(screen.getByText("All (10)")).toBeInTheDocument()
    })

    it("renders with zero count", () => {
      render(<TabBtn {...defaultProps} count={0} />)
      expect(screen.getByText("All (0)")).toBeInTheDocument()
    })

    it("renders different labels correctly", () => {
      render(<TabBtn {...defaultProps} label="Pending" count={3} />)
      expect(screen.getByText("Pending (3)")).toBeInTheDocument()
    })
  })

  describe("active state", () => {
    it("applies active class when active is true", () => {
      render(<TabBtn {...defaultProps} active={true} />)
      expect(screen.getByRole("button")).toHaveClass("active")
    })

    it("does not apply active class when active is false", () => {
      render(<TabBtn {...defaultProps} active={false} />)
      expect(screen.getByRole("button")).not.toHaveClass("active")
    })

    it("always has tab-btn class", () => {
      render(<TabBtn {...defaultProps} />)
      expect(screen.getByRole("button")).toHaveClass("tab-btn")
    })
  })

  describe("onClick", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn()
      render(<TabBtn {...defaultProps} onClick={handleClick} />)
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("calls onClick when active tab is clicked again", () => {
      const handleClick = vi.fn()
      render(<TabBtn {...defaultProps} active={true} onClick={handleClick} />)
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

})