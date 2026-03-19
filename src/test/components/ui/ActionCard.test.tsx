import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ActionCard } from "../../../components/ui/ActionCard"

describe("ActionCard", () => {

  const defaultProps = {
    icon: <span data-testid="test-icon"></span>,
    title: "Currency Management",
    description: "Add, edit, and manage supported currencies",
    linkText: "Manage Currencies",
    onClick: vi.fn(),
  }

  describe("rendering", () => {
    it("renders the title", () => {
      render(<ActionCard {...defaultProps} />)
      expect(screen.getByText("Currency Management")).toBeInTheDocument()
    })

    it("renders the description", () => {
      render(<ActionCard {...defaultProps} />)
      expect(screen.getByText("Add, edit, and manage supported currencies")).toBeInTheDocument()
    })

    it("renders the link text", () => {
      render(<ActionCard {...defaultProps} />)
      expect(screen.getByText(/Manage Currencies/)).toBeInTheDocument()
    })

    it("renders the icon", () => {
      render(<ActionCard {...defaultProps} />)
      expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    })

    it("renders the arrow icon alongside link text", () => {
      const { container } = render(<ActionCard {...defaultProps} />)
      const linkBtn = container.querySelector(".link")
      expect(linkBtn).toBeInTheDocument()
    })
  })

  describe("onClick", () => {
    it("calls onClick when link button is clicked", () => {
      const handleClick = vi.fn()
      render(<ActionCard {...defaultProps} onClick={handleClick} />)
      fireEvent.click(screen.getByText(/Manage Currencies/))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("does not call onClick when clicking the card body", () => {
      const handleClick = vi.fn()
      render(<ActionCard {...defaultProps} onClick={handleClick} />)
      fireEvent.click(screen.getByText("Currency Management"))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("css classes", () => {
    it("applies action-card class to root", () => {
      const { container } = render(<ActionCard {...defaultProps} />)
      expect(container.firstChild).toHaveClass("action-card")
    })

    it("applies icon class to icon wrapper", () => {
      const { container } = render(<ActionCard {...defaultProps} />)
      expect(container.querySelector(".icon")).toBeInTheDocument()
    })

    it("applies link class to button", () => {
      const { container } = render(<ActionCard {...defaultProps} />)
      expect(container.querySelector(".link")).toBeInTheDocument()
    })
  })

})