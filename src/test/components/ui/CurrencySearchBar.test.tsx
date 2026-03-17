import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CurrencySearchBar } from "../../../components/ui/CurrencySearchBar"

describe("CurrencySearchBar", () => {

  describe("rendering", () => {
    it("renders the input", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toBeInTheDocument()
    })

    it("renders default placeholder", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
    })

    it("renders custom placeholder", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} placeholder="Search currencies..." />)
      expect(screen.getByPlaceholderText("Search currencies...")).toBeInTheDocument()
    })

    it("renders subtitle when provided", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} subtitle="Showing 10 currencies" />)
      expect(screen.getByText("Showing 10 currencies")).toBeInTheDocument()
    })

    it("does not render subtitle when not provided", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    })

    it("shows current value in input", () => {
      render(<CurrencySearchBar value="USD" onChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveValue("USD")
    })
  })

  describe("clear button", () => {
    it("shows clear button when value is present", () => {
      render(<CurrencySearchBar value="USD" onChange={vi.fn()} />)
      expect(screen.getByText("x")).toBeInTheDocument()
    })

    it("hides clear button when value is empty", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(screen.queryByText("x")).not.toBeInTheDocument()
    })

    it("calls onChange with empty string when clear is clicked", () => {
      const handleChange = vi.fn()
      render(<CurrencySearchBar value="USD" onChange={handleChange} />)
      fireEvent.mouseDown(screen.getByText("x"))
      expect(handleChange).toHaveBeenCalledWith("")
    })
  })

  describe("debounce", () => {
    it("calls onChange after debounce delay", async () => {
      vi.useFakeTimers()
      const handleChange = vi.fn()
      render(<CurrencySearchBar value="" onChange={handleChange} />)

      fireEvent.change(screen.getByRole("textbox"), { target: { value: "GBP" } })
      expect(handleChange).not.toHaveBeenCalled()

      act(() => { vi.advanceTimersByTime(350) })
      expect(handleChange).toHaveBeenCalledWith("GBP")

      vi.useRealTimers()
    })

    it("debounces rapid keystrokes — only fires once", async () => {
      vi.useFakeTimers()
      const handleChange = vi.fn()
      render(<CurrencySearchBar value="" onChange={handleChange} />)

      fireEvent.change(screen.getByRole("textbox"), { target: { value: "G" } })
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "GB" } })
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "GBP" } })

      act(() => { vi.advanceTimersByTime(350) })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith("GBP")

      vi.useRealTimers()
    })
  })

  describe("focus state", () => {
    it("applies focused class on input focus", () => {
      const { container } = render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      fireEvent.focus(screen.getByRole("textbox"))
      expect(container.querySelector(".search-bar-input-row")).toHaveClass("focused")
    })

    it("removes focused class on blur", () => {
      const { container } = render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      fireEvent.focus(screen.getByRole("textbox"))
      fireEvent.blur(screen.getByRole("textbox"))
      expect(container.querySelector(".search-bar-input-row")).not.toHaveClass("focused")
    })
  })

  describe("css classes", () => {
    it("applies search-bar-wrapper class to root", () => {
      const { container } = render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(container.firstChild).toHaveClass("search-bar-wrapper")
    })

    it("applies search-bar-input class to input", () => {
      render(<CurrencySearchBar value="" onChange={vi.fn()} />)
      expect(screen.getByRole("textbox")).toHaveClass("search-bar-input")
    })
  })

})