import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DepositPage } from "../../../pages/customer/DepositPage"

vi.mock("../../../hooks/customer/useDeposit", () => ({ useDeposit: vi.fn() }))
vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import { useDeposit } from "../../../hooks/customer/useDeposit"
import useSWR from "swr"

const mockUseDeposit = vi.mocked(useDeposit)
const mockUseSWR     = vi.mocked(useSWR)
const mockDeposit    = vi.fn()

const defaultDepositHook = {
  deposit: mockDeposit,
  isLoading: false,
  error: null,
}

const mockDepositResult = {
  ok: true,
  message: "Successfully deposited 1000 GBP",
  deposit: { amount: "1000", currency: "GBP", new_balance: "11000" },
}

describe("DepositPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeposit.mockReturnValue(defaultDepositHook)
    mockUseSWR.mockReturnValue({ data: { user: { username: "sumit" } }, isLoading: false } as any)
  })

  describe("rendering", () => {
    it("renders deposit welcome section", () => {
      render(<DepositPage />)
      expect(document.querySelector(".deposit-welcome")).toBeInTheDocument()
    })

    it("renders welcome message", () => {
      render(<DepositPage />)
      expect(screen.getByText("Welcome,")).toBeInTheDocument()
    })

    it("renders username in welcome message", () => {
      render(<DepositPage />)
      expect(screen.getByText("sumit")).toBeInTheDocument()
    })

    it("renders subtitle text", () => {
      render(<DepositPage />)
      expect(screen.getByText(/Add GBP to your account/)).toBeInTheDocument()
    })

    it("renders Quick Select Amount label", () => {
      render(<DepositPage />)
      expect(screen.getByText("Quick Select Amount")).toBeInTheDocument()
    })

    it("renders all 4 preset amount buttons", () => {
      render(<DepositPage />)
      expect(screen.getByText("£500")).toBeInTheDocument()
      expect(screen.getByText("£1,000")).toBeInTheDocument()
      expect(screen.getByText("£2,500")).toBeInTheDocument()
      expect(screen.getByText("£5,000")).toBeInTheDocument()
    })

    it("renders Bank Details section", () => {
      render(<DepositPage />)
      expect(screen.getByText("Bank Details")).toBeInTheDocument()
    })

    it("renders Account Number field", () => {
      render(<DepositPage />)
      expect(screen.getByPlaceholderText("12345678")).toBeInTheDocument()
    })

    it("renders Sort Code field", () => {
      render(<DepositPage />)
      expect(screen.getByPlaceholderText("12-34-56")).toBeInTheDocument()
    })

    it("renders Amount field", () => {
      render(<DepositPage />)
      expect(screen.getByPlaceholderText("e.g. 1000")).toBeInTheDocument()
    })

    it("renders Bank Name field", () => {
      render(<DepositPage />)
      expect(screen.getByPlaceholderText("e.g. HSBC, Barclays, Lloyds")).toBeInTheDocument()
    })

    it("renders Simulated Deposit info box", () => {
      render(<DepositPage />)
      expect(screen.getByText(/Simulated Deposit/)).toBeInTheDocument()
    })

    it("renders deposit button with £0.00 by default", () => {
      render(<DepositPage />)
      expect(document.querySelector(".deposit-submit-btn")?.textContent).toBe("Deposit £0.00")
    })
  })

  describe("preset amounts", () => {
    it("clicking £500 updates deposit button amount", async () => {
      render(<DepositPage />)
      fireEvent.click(screen.getByText("£500"))
      await waitFor(() => {
        expect(document.querySelector(".deposit-submit-btn")?.textContent).toBe("Deposit £500.00")
      })
    })

    it("clicking £1,000 updates deposit button amount", async () => {
      render(<DepositPage />)
      fireEvent.click(screen.getByText("£1,000"))
      await waitFor(() => {
        expect(document.querySelector(".deposit-submit-btn")?.textContent).toBe("Deposit £1,000.00")
      })
    })

    it("active preset has active class", () => {
      render(<DepositPage />)
      fireEvent.click(screen.getByText("£500"))
      const btn = screen.getByText("£500").closest("button")
      expect(btn?.className).toContain("active")
    })

    it("only one preset is active at a time", async () => {
      render(<DepositPage />)
      fireEvent.click(screen.getByText("£500"))
      fireEvent.click(screen.getByText("£1,000"))
      // last clicked preset wins — deposit button shows £1,000
      await waitFor(() => {
        expect(document.querySelector(".deposit-submit-btn")?.textContent).toBe("Deposit £1,000.00")
      })
    })
  })

  // helper — fills all required fields
  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText("e.g. 1000"),                    { target: { value: "1000" } })
    fireEvent.change(screen.getByPlaceholderText("12345678"),                     { target: { value: "12345678" } })
    fireEvent.change(screen.getByPlaceholderText("12-34-56"),                     { target: { value: "12-34-56" } })
    fireEvent.change(screen.getByPlaceholderText("e.g. HSBC, Barclays, Lloyds"), { target: { value: "HSBC" } })
  }

  describe("form submission", () => {
    it("calls deposit on form submit", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalled()
      })
    })

    it("shows Deposit Successful heading after success", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText("Deposit Successful!")).toBeInTheDocument()
      })
    })

    it("shows deposited amount in success message", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText(/£1,000.00 has been added/)).toBeInTheDocument()
      })
    })

    it("shows new balance in success state", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText(/New GBP Balance: £11,000.00/)).toBeInTheDocument()
      })
    })

    it("shows Make Another Deposit button after success", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText("Make Another Deposit")).toBeInTheDocument()
      })
    })

    it("hides form after success", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("12345678")).not.toBeInTheDocument()
      })
    })

    it("resets to form when Make Another Deposit clicked", async () => {
      mockDeposit.mockResolvedValue(mockDepositResult)
      render(<DepositPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => screen.getByText("Make Another Deposit"))
      fireEvent.click(screen.getByText("Make Another Deposit"))
      await waitFor(() => {
        expect(screen.getByPlaceholderText("12345678")).toBeInTheDocument()
      })
    })
  })

  describe("error state", () => {
    it("shows server error message", () => {
      mockUseDeposit.mockReturnValue({ ...defaultDepositHook, error: "Deposit failed" })
      render(<DepositPage />)
      expect(screen.getByText("Deposit failed")).toBeInTheDocument()
    })

    it("shows different error messages", () => {
      mockUseDeposit.mockReturnValue({ ...defaultDepositHook, error: "account_number must be 8 digits" })
      render(<DepositPage />)
      expect(screen.getByText("account_number must be 8 digits")).toBeInTheDocument()
    })
  })

  describe("loading state", () => {
    it("shows Processing text when loading", () => {
      mockUseDeposit.mockReturnValue({ ...defaultDepositHook, isLoading: true })
      render(<DepositPage />)
      expect(screen.getByText("Processing...")).toBeInTheDocument()
    })

    it("disables submit button when loading", () => {
      mockUseDeposit.mockReturnValue({ ...defaultDepositHook, isLoading: true })
      render(<DepositPage />)
      expect(document.querySelector(".deposit-submit-btn")).toBeDisabled()
    })

    it("submit button is enabled when not loading", () => {
      render(<DepositPage />)
      expect(document.querySelector(".deposit-submit-btn")).not.toBeDisabled()
    })
  })

})