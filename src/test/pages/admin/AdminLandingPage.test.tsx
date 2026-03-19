import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AdminLandingPage } from "../../../pages/admin/AdminLandingPage"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))
vi.mock("@/api/auth", () => ({ logout: vi.fn() }))
vi.mock("@/api/client", () => ({ getAccessToken: vi.fn().mockReturnValue("mock-token") }))

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => vi.fn(),
}))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

describe("AdminLandingPage", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("shows loading state", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as any)
    render(<AdminLandingPage />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders nav when user is admin", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin", username: "adminuser" } }, isLoading: false, error: undefined } as any)
    render(<AdminLandingPage />)
    expect(screen.getByText("FX Admin Panel")).toBeInTheDocument()
  })

  it("renders username in nav", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin", username: "adminuser" } }, isLoading: false, error: undefined } as any)
    render(<AdminLandingPage />)
    expect(screen.getByText("Welcome, adminuser")).toBeInTheDocument()
  })

  it("renders logout button", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin", username: "adminuser" } }, isLoading: false, error: undefined } as any)
    render(<AdminLandingPage />)
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })

  it("renders outlet for page content", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "admin", username: "adminuser" } }, isLoading: false, error: undefined } as any)
    render(<AdminLandingPage />)
    expect(screen.getByTestId("outlet")).toBeInTheDocument()
  })

  it("renders nothing and redirects when no user", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false, error: new Error("Unauthorized") } as any)
    const { container } = render(<AdminLandingPage />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing and redirects when role is not admin", () => {
    mockUseSWR.mockReturnValue({ data: { user: { role: "customer", username: "user" } }, isLoading: false, error: undefined } as any)
    const { container } = render(<AdminLandingPage />)
    expect(container.firstChild).toBeNull()
  })

})