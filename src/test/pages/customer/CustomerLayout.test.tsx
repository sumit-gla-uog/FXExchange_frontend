import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CustomerLayout } from "../../../pages/customer/CustomerLayout"

vi.mock("react-router-dom", () => ({
  Outlet:         () => <div data-testid="outlet" />,
  useNavigate:    () => mockNavigate,
  useLocation:    () => mockLocation,
}))
vi.mock("@/api/auth", () => ({ logout: vi.fn() }))
vi.mock("../../../hooks/useIsMobile", () => ({ useIsMobile: () => mockIsMobile }))
vi.mock("../../../pages/customer/CustomerSidebar", () => ({
  CustomerSidebar: ({ collapsed, onToggle, isMobile }: any) => (
    <div data-testid="sidebar" data-collapsed={collapsed} data-mobile={isMobile}>
      <button onClick={onToggle}>toggle</button>
    </div>
  ),
}))

const mockNavigate = vi.fn()
let mockLocation = { pathname: "/customer/dashboard" }
let mockIsMobile = false

describe("CustomerLayout", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation = { pathname: "/customer/dashboard" }
    mockIsMobile = false
  })

  describe("rendering", () => {
    it("renders sidebar", () => {
      render(<CustomerLayout />)
      expect(screen.getByTestId("sidebar")).toBeInTheDocument()
    })

    it("renders outlet", () => {
      render(<CustomerLayout />)
      expect(screen.getByTestId("outlet")).toBeInTheDocument()
    })

    it("renders logout button", () => {
      render(<CustomerLayout />)
      expect(screen.getByText("Logout")).toBeInTheDocument()
    })
  })

  describe("page meta titles", () => {
    it("shows Dashboard title for /customer/dashboard", () => {
      mockLocation = { pathname: "/customer/dashboard" }
      render(<CustomerLayout />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })

    it("shows Portfolio title for /customer/portfolio", () => {
      mockLocation = { pathname: "/customer/portfolio" }
      render(<CustomerLayout />)
      expect(screen.getByText("Portfolio")).toBeInTheDocument()
    })

    it("shows Currencies title for /customer/currencies", () => {
      mockLocation = { pathname: "/customer/currencies" }
      render(<CustomerLayout />)
      expect(screen.getByText("Currencies")).toBeInTheDocument()
    })

    it("shows Trading Pairs title for /customer/pairs", () => {
      mockLocation = { pathname: "/customer/pairs" }
      render(<CustomerLayout />)
      expect(screen.getByText("Trading Pairs")).toBeInTheDocument()
    })

    it("shows Orders title for /customer/orders", () => {
      mockLocation = { pathname: "/customer/orders" }
      render(<CustomerLayout />)
      expect(screen.getByText("Orders")).toBeInTheDocument()
    })

    it("shows History title for /customer/history", () => {
      mockLocation = { pathname: "/customer/history" }
      render(<CustomerLayout />)
      expect(screen.getByText("History")).toBeInTheDocument()
    })

    it("shows default title for unknown path", () => {
      mockLocation = { pathname: "/customer/unknown" }
      render(<CustomerLayout />)
      expect(screen.getByText("Customer")).toBeInTheDocument()
    })
  })

  describe("mobile behaviour", () => {
    it("applies mobile class to topbar when isMobile", () => {
      mockIsMobile = true
      render(<CustomerLayout />)
      expect(document.querySelector(".customer-topbar.mobile")).toBeInTheDocument()
    })

    it("does not apply mobile class when not mobile", () => {
      mockIsMobile = false
      render(<CustomerLayout />)
      expect(document.querySelector(".customer-topbar.mobile")).not.toBeInTheDocument()
    })

    it("passes isMobile to sidebar", () => {
      mockIsMobile = true
      render(<CustomerLayout />)
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-mobile", "true")
    })
  })

  describe("sidebar collapse", () => {
    it("sidebar starts uncollapsed", () => {
      render(<CustomerLayout />)
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "false")
    })

    it("toggles sidebar collapsed state on toggle click", () => {
      render(<CustomerLayout />)
      fireEvent.click(screen.getByText("toggle"))
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "true")
    })

    it("toggles back to uncollapsed on second click", () => {
      render(<CustomerLayout />)
      fireEvent.click(screen.getByText("toggle"))
      fireEvent.click(screen.getByText("toggle"))
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "false")
    })
  })

  describe("logout", () => {
    it("calls logout and navigates on logout click", async () => {
      const { logout } = await import("@/api/auth")
      render(<CustomerLayout />)
      fireEvent.click(screen.getByText("Logout"))
      expect(logout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true })
    })
  })

})