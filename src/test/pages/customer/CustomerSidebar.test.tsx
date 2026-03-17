import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CustomerSidebar } from "../../../pages/customer/CustomerSidebar"

vi.mock("react-router-dom", () => ({
  NavLink: ({ to, children, className }: any) => (
    <a href={to} className={typeof className === "function" ? className({ isActive: to === mockPathname }) : className}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: mockPathname }),
}))

let mockPathname = "/customer/dashboard"

const defaultProps = {
  collapsed: false,
  onToggle: vi.fn(),
  isMobile: false,
}

describe("CustomerSidebar", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = "/customer/dashboard"
  })

  describe("desktop sidebar", () => {
    it("renders FX Exchange brand", () => {
      render(<CustomerSidebar {...defaultProps} />)
      expect(screen.getByText("FX Exchange")).toBeInTheDocument()
    })

    it("renders FX logo", () => {
      render(<CustomerSidebar {...defaultProps} />)
      expect(screen.getByText("FX")).toBeInTheDocument()
    })

    it("renders all 7 nav items", () => {
      render(<CustomerSidebar {...defaultProps} />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Portfolio")).toBeInTheDocument()
      expect(screen.getByText("Currencies")).toBeInTheDocument()
      expect(screen.getByText("Pairs")).toBeInTheDocument()
      expect(screen.getByText("Orders")).toBeInTheDocument()
      expect(screen.getByText("History")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })

    it("renders toggle button with ✕ when expanded", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={false} />)
      expect(screen.getByText("✕")).toBeInTheDocument()
    })

    it("renders toggle button with ☰ when collapsed", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={true} />)
      expect(screen.getByText("☰")).toBeInTheDocument()
    })

    it("calls onToggle when toggle button clicked", () => {
      const onToggle = vi.fn()
      render(<CustomerSidebar {...defaultProps} onToggle={onToggle} />)
      fireEvent.click(screen.getByText("✕"))
      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it("hides brand text when collapsed", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={true} />)
      expect(screen.queryByText("FX Exchange")).not.toBeInTheDocument()
    })

    it("hides nav labels when collapsed", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={true} />)
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })

    it("applies sidebar-desktop class", () => {
      render(<CustomerSidebar {...defaultProps} />)
      expect(document.querySelector(".sidebar-desktop")).toBeInTheDocument()
    })

    it("sets width to 240 when expanded", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={false} />)
      const aside = document.querySelector(".sidebar-desktop") as HTMLElement
      expect(aside.style.width).toBe("240px")
    })

    it("sets width to 72 when collapsed", () => {
      render(<CustomerSidebar {...defaultProps} collapsed={true} />)
      const aside = document.querySelector(".sidebar-desktop") as HTMLElement
      expect(aside.style.width).toBe("72px")
    })
  })

  describe("mobile sidebar", () => {
    it("renders mobile nav when isMobile is true", () => {
      render(<CustomerSidebar {...defaultProps} isMobile={true} />)
      expect(document.querySelector(".sidebar-mobile-nav")).toBeInTheDocument()
    })

    it("does not render desktop sidebar when isMobile", () => {
      render(<CustomerSidebar {...defaultProps} isMobile={true} />)
      expect(document.querySelector(".sidebar-desktop")).not.toBeInTheDocument()
    })

    it("renders 6 visible items in mobile nav (excludes Settings)", () => {
      render(<CustomerSidebar {...defaultProps} isMobile={true} />)
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Portfolio")).toBeInTheDocument()
      expect(screen.getByText("Currencies")).toBeInTheDocument()
      expect(screen.getByText("Pairs")).toBeInTheDocument()
      expect(screen.getByText("Orders")).toBeInTheDocument()
      expect(screen.getByText("History")).toBeInTheDocument()
      expect(screen.queryByText("Settings")).not.toBeInTheDocument()
    })

    it("applies active class to current route item", () => {
      mockPathname = "/customer/dashboard"
      render(<CustomerSidebar {...defaultProps} isMobile={true} />)
      const dashLink = screen.getByText("Dashboard").closest("a")
      expect(dashLink?.className).toContain("active")
    })

    it("does not apply active class to non-current route", () => {
      mockPathname = "/customer/dashboard"
      render(<CustomerSidebar {...defaultProps} isMobile={true} />)
      const portfolioLink = screen.getByText("Portfolio").closest("a")
      expect(portfolioLink?.className).not.toContain("active")
    })
  })

})