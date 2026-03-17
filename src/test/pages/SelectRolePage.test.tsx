import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SelectRolePage } from "../../pages/SelectRolePage/SelectRolePage"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))
vi.mock("@/api/client", () => ({ getAccessToken: vi.fn().mockReturnValue("mock-token") }))
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)
const mockNavigate = vi.fn()

describe("SelectRolePage", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("shows loading when fetching user", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
    render(<SelectRolePage />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders Select Role heading", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    expect(screen.getByText("Select Role")).toBeInTheDocument()
  })

  it("renders Continue as Customer button for all users", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    expect(screen.getByText("Continue as Customer")).toBeInTheDocument()
  })

  it("does not render Continue as Admin for customer role", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    expect(screen.queryByText("Continue as Admin")).not.toBeInTheDocument()
  })

  it("renders Continue as Admin button for admin role", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    expect(screen.getByText("Continue as Admin")).toBeInTheDocument()
  })

  it("navigates to /customer on Continue as Customer click", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    fireEvent.click(screen.getByText("Continue as Customer"))
    expect(mockNavigate).toHaveBeenCalledWith("/customer", { replace: true })
  })

  it("navigates to /admin on Continue as Admin click", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    fireEvent.click(screen.getByText("Continue as Admin"))
    expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true })
  })

  it("stores active_role in localStorage on customer selection", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    fireEvent.click(screen.getByText("Continue as Customer"))
    expect(localStorage.getItem("active_role")).toBe("customer")
  })

  it("stores active_role in localStorage on admin selection", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin" } }, isLoading: false } as any)
    render(<SelectRolePage />)
    fireEvent.click(screen.getByText("Continue as Admin"))
    expect(localStorage.getItem("active_role")).toBe("admin")
  })

})