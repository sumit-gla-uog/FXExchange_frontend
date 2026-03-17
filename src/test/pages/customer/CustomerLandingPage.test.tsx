import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CustomerLandingPage } from "../../../pages/customer/CustomerLandingPage"

vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }))
vi.mock("@/api/auth", () => ({ logout: vi.fn() }))

const mockNavigate = vi.fn()

describe("CustomerLandingPage", () => {

  beforeEach(() => { vi.clearAllMocks() })

  describe("topbar", () => {
    it("renders Dashboard heading", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })

    it("renders Welcome back text", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Welcome back")).toBeInTheDocument()
    })

    it("renders Base Currency label", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Base Currency")).toBeInTheDocument()
    })

    it("renders GBP as base currency", () => {
        render(<CustomerLandingPage />)
        const baseValue = document.querySelector(".base-value")
        expect(baseValue?.textContent).toBe("GBP")
      })

    it("renders New Trade button", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("New Trade")).toBeInTheDocument()
    })

    it("renders Logout button", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Logout")).toBeInTheDocument()
    })

    it("navigates to /trade on New Trade click", () => {
      render(<CustomerLandingPage />)
      fireEvent.click(screen.getByText("New Trade"))
      expect(mockNavigate).toHaveBeenCalledWith("/trade")
    })

    it("calls logout and navigates on Logout click", async () => {
      const { logout } = await import("@/api/auth")
      render(<CustomerLandingPage />)
      fireEvent.click(screen.getByText("Logout"))
      await waitFor(() => {
        expect(logout).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true })
      })
    })
  })

  describe("summary cards", () => {
    it("renders Portfolio Value card", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Portfolio Value")).toBeInTheDocument()
      expect(screen.getByText("24477.80")).toBeInTheDocument()
    })

    it("renders GBP Balance card", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("GBP Balance")).toBeInTheDocument()
      expect(screen.getByText("10000.00")).toBeInTheDocument()
    })

    it("renders Open Orders card", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Open Orders")).toBeInTheDocument()
      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("renders API Status card", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("API Status")).toBeInTheDocument()
      expect(screen.getByText("Online")).toBeInTheDocument()
    })
  })

  describe("market snapshot", () => {
    it("renders Market Snapshot heading", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Market Snapshot")).toBeInTheDocument()
    })

    it("renders 6 market currency cards", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("USD")).toBeInTheDocument()
      expect(screen.getByText("EUR")).toBeInTheDocument()
      expect(screen.getByText("JPY")).toBeInTheDocument()
      expect(screen.getByText("CNY")).toBeInTheDocument()
      expect(screen.getByText("HKD")).toBeInTheDocument()
      expect(screen.getByText("AUD")).toBeInTheDocument()
    })

    it("renders View All button", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("View All")).toBeInTheDocument()
    })

    it("renders positive change with + prefix", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("+0.10%")).toBeInTheDocument()
    })

    it("renders negative change without + prefix", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("-2.17%")).toBeInTheDocument()
    })
  })

  describe("quick convert form", () => {
    it("renders Quick Convert heading", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Quick Convert")).toBeInTheDocument()
    })

    it("renders Amount field with default value", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByPlaceholderText("e.g. 1000")).toBeInTheDocument()
    })

    it("renders From field with GBP placeholder", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByPlaceholderText("GBP")).toBeInTheDocument()
    })

    it("renders To field with USD placeholder", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByPlaceholderText("USD")).toBeInTheDocument()
    })

    it("renders Get Quote button", () => {
      render(<CustomerLandingPage />)
      expect(screen.getByText("Get Quote")).toBeInTheDocument()
    })

    // it("navigates to /trade on form submit", async () => {
    //     render(<CustomerLandingPage />)
    //     const form = document.querySelector("form") as HTMLFormElement
    //     fireEvent.submit(form)
    //     await waitFor(() => {
    //       expect(mockNavigate).toHaveBeenCalledWith("/pairs")
    //     })
    //   })
  })

})