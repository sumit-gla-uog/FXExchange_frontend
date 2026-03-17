import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AdminCurrenciesPage } from "../../../pages/admin/AdminCurrenciesPage"

vi.mock("../../../hooks/admin/useAdminCurrencies", () => ({
  useAdminCurrencies: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("ag-grid-react", () => ({
  AgGridReact: () => <div data-testid="ag-grid" />,
}))

import { useAdminCurrencies } from "../../../hooks/admin/useAdminCurrencies"
const mockUseAdminCurrencies = vi.mocked(useAdminCurrencies)

const mockCurrencies = [
  { id: 1, code: "USD", name: "US Dollar",  symbol: "$", flag: "usd", enabled: true  },
  { id: 2, code: "EUR", name: "Euro",        symbol: "€", flag: "eur", enabled: false },
]

const defaultHook = {
  currencies: mockCurrencies,
  isLoading: false,
  handleAdd: vi.fn().mockResolvedValue(undefined),
  handleToggle: vi.fn().mockResolvedValue(undefined),
}

describe("AdminCurrenciesPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAdminCurrencies.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders page title", () => {
      render(<AdminCurrenciesPage />)
      expect(screen.getByText("Currency Management")).toBeInTheDocument()
    })

    it("renders back to dashboard button", () => {
      render(<AdminCurrenciesPage />)
      expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument()
    })

    it("renders Add Currency button", () => {
      render(<AdminCurrenciesPage />)
      expect(screen.getByText(/Add Currency/)).toBeInTheDocument()
    })

    it("renders AG Grid when loaded", () => {
      render(<AdminCurrenciesPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })

    it("shows spinner while loading", () => {
      mockUseAdminCurrencies.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<AdminCurrenciesPage />)
      expect(document.querySelector(".currencies-spinner")).toBeInTheDocument()
    })
  })

  describe("add currency form", () => {
    it("form is hidden by default", () => {
      render(<AdminCurrenciesPage />)
      expect(screen.queryByText("Add New Currency")).not.toBeInTheDocument()
    })

    it("shows form when Add Currency button clicked", () => {
      render(<AdminCurrenciesPage />)
      fireEvent.click(screen.getByText(/Add Currency/))
      expect(screen.getByText("Add New Currency")).toBeInTheDocument()
    })

    it("hides form when close button clicked", () => {
      render(<AdminCurrenciesPage />)
      fireEvent.click(screen.getByText(/Add Currency/))
      expect(screen.getByText("Add New Currency")).toBeInTheDocument()
      // close button is inside .currencies-form-header alongside the title
      const formHeader = document.querySelector(".currencies-form-header")
      const closeBtn = formHeader?.querySelector("button")
      fireEvent.click(closeBtn!)
      expect(screen.queryByText("Add New Currency")).not.toBeInTheDocument()
    })

    it("renders form fields", () => {
      render(<AdminCurrenciesPage />)
      fireEvent.click(screen.getByText(/Add Currency/))
      expect(screen.getByPlaceholderText("e.g., USD")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("e.g., US Dollar")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("e.g., $")).toBeInTheDocument()
    })

    // it("shows success message after successful add", async () => {
    //   render(<AdminCurrenciesPage />)
    //   fireEvent.click(screen.getByText(/Add Currency/))

    //   // submit form directly — bypasses react-hook-form validation in tests
    //   const form = document.querySelector("form") as HTMLFormElement
    //   fireEvent.submit(form)

    //   await waitFor(() => {
    //     expect(defaultHook.handleAdd).toHaveBeenCalled()
    //   })
    // })

    // it("shows error message when add fails", async () => {
    //   mockUseAdminCurrencies.mockReturnValue({
    //     ...defaultHook,
    //     handleAdd: vi.fn().mockRejectedValue(new Error("Currency already exists")),
    //   })
    //   render(<AdminCurrenciesPage />)
    //   fireEvent.click(screen.getByText(/Add Currency/))

    //   const form = document.querySelector(".currencies-form-btn--submit") as HTMLElement
    //   fireEvent.submit(form)

    //   await waitFor(() => {
    //     expect(screen.getByText("Currency already exists")).toBeInTheDocument()
    //   })
    // })
  })

})