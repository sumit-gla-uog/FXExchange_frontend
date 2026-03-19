import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SelectRolePage } from "../../pages/SelectRolePage/SelectRolePage"

vi.mock("../../hooks/useSelectRole", () => ({ useSelectRole: vi.fn() }))

import { useSelectRole } from "../../hooks/useSelectRole"
const mockUseSelectRole = vi.mocked(useSelectRole)

const mockPick = vi.fn()

const defaultHook = {
  username: "sumit",
  isAdmin: false,
  isLoading: false,
  pick: mockPick,
}

describe("SelectRolePage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSelectRole.mockReturnValue(defaultHook)
  })

  describe("loading state", () => {
    it("shows loading when fetching", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<SelectRolePage />)
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
  })

  describe("rendering", () => {
    it("renders FX Exchange heading", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("FX Exchange")).toBeInTheDocument()
    })

    it("renders currency exchange icon logo", () => {
      const { container } = render(<SelectRolePage />)
      expect(container.querySelector(".select-role-logo")).toBeInTheDocument()
    })

    it("renders welcome back text", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("Welcome back,")).toBeInTheDocument()
    })

    it("renders username", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("sumit")).toBeInTheDocument()
    })

    it("renders Select Role label", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("Select Role")).toBeInTheDocument()
    })

    it("renders Customer option", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("Customer")).toBeInTheDocument()
    })

    it("renders Customer description", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("View balances and exchange currencies")).toBeInTheDocument()
    })

    it("does not render Administrator option for customer role", () => {
      render(<SelectRolePage />)
      expect(screen.queryByText("Administrator")).not.toBeInTheDocument()
    })

    it("renders Administrator option for admin role", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isAdmin: true })
      render(<SelectRolePage />)
      expect(screen.getByText("Administrator")).toBeInTheDocument()
    })

    it("renders disclaimer text", () => {
      render(<SelectRolePage />)
      expect(screen.getByText(/simulated trading platform/)).toBeInTheDocument()
    })
  })

  describe("role selection", () => {
    it("Customer is selected by default", () => {
      render(<SelectRolePage />)
      const customerOption = screen.getByText("Customer").closest(".select-role-option")
      expect(customerOption).toHaveClass("active")
    })

    it("Continue button shows Customer by default", () => {
      render(<SelectRolePage />)
      expect(screen.getByText("Continue as Customer")).toBeInTheDocument()
    })

    it("selecting Admin updates button text", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isAdmin: true })
      render(<SelectRolePage />)
      fireEvent.click(screen.getByText("Administrator").closest(".select-role-option")!)
      expect(screen.getByText("Continue as Administrator")).toBeInTheDocument()
    })

    it("clicking Customer option makes it active", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isAdmin: true })
      render(<SelectRolePage />)
      fireEvent.click(screen.getByText("Administrator").closest(".select-role-option")!)
      fireEvent.click(screen.getByText("Customer").closest(".select-role-option")!)
      const customerOption = screen.getByText("Customer").closest(".select-role-option")
      expect(customerOption).toHaveClass("active")
    })

    it("clicking Admin option makes it active", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isAdmin: true })
      render(<SelectRolePage />)
      fireEvent.click(screen.getByText("Administrator").closest(".select-role-option")!)
      const adminOption = screen.getByText("Administrator").closest(".select-role-option")
      expect(adminOption).toHaveClass("active")
    })
  })

  describe("continue button", () => {
    it("calls pick with customer when Customer selected", () => {
      render(<SelectRolePage />)
      fireEvent.click(screen.getByText("Continue as Customer"))
      expect(mockPick).toHaveBeenCalledWith("customer")
    })

    it("calls pick with admin when Admin selected", () => {
      mockUseSelectRole.mockReturnValue({ ...defaultHook, isAdmin: true })
      render(<SelectRolePage />)
      fireEvent.click(screen.getByText("Administrator").closest(".select-role-option")!)
      fireEvent.click(screen.getByText("Continue as Administrator"))
      expect(mockPick).toHaveBeenCalledWith("admin")
    })
  })

})