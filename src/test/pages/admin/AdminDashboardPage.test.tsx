import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AdminDashboardPage } from "../../../pages/admin/AdminDashboardPage"

vi.mock("../../../hooks/admin/useAdminDashboard", () => ({
  useAdminDashboard: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}))

// Mock shared components that have their own tests
vi.mock("../../../components/ui/StatCard", () => ({
  StatCard: ({ label, value, sub }: any) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
      {sub && <span>{sub}</span>}
    </div>
  ),
}))

vi.mock("../../../components/ui/ActionCard", () => ({
  ActionCard: ({ title, description, linkText }: any) => (
    <div data-testid="action-card">
      <span>{title}</span>
      <span>{description}</span>
      <span>{linkText}</span>
    </div>
  ),
}))

import { useAdminDashboard } from "../../../hooks/admin/useAdminDashboard"
const mockUseAdminDashboard = vi.mocked(useAdminDashboard)

const mockData = {
  total_currencies: 11,
  enabled_currencies: 10,
  total_pairs: 5,
  total_rates: 13,
  stale_rates: 2,
  unavailable_rates: 0,
  api_status: "ok",
  last_check: "2026-03-17T10:00:00Z",
  uptime_pct: "99.9",
}

describe("AdminDashboardPage", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("shows spinner while loading", () => {
    mockUseAdminDashboard.mockReturnValue({ data: undefined, isLoading: true })
    render(<AdminDashboardPage />)
    expect(document.querySelector(".dashboard-spinner")).toBeInTheDocument()
  })

  it("renders page title", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument()
  })

  it("renders 4 stat cards", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getAllByTestId("stat-card")).toHaveLength(4)
  })

  it("renders Total Currencies stat", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Total Currencies")).toBeInTheDocument()
    expect(screen.getByText("11")).toBeInTheDocument()
  })

  it("renders Stale Rates stat", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Stale Rates")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("renders 2 action cards", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getAllByTestId("action-card")).toHaveLength(2)
  })

  it("renders Currency Management action card", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Currency Management")).toBeInTheDocument()
  })

  it("renders Rate Management action card", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Rate Management")).toBeInTheDocument()
  })

  it("renders Admin Responsibilities section", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText("Admin Responsibilities")).toBeInTheDocument()
  })

  it("renders all 4 responsibility items", () => {
    mockUseAdminDashboard.mockReturnValue({ data: mockData, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getByText(/Maintain the Currency Master table/)).toBeInTheDocument()
    expect(screen.getByText(/Monitor rate API health/)).toBeInTheDocument()
    expect(screen.getByText(/Review and validate manual rate imports/)).toBeInTheDocument()
    expect(screen.getByText(/Ensure audit logs/)).toBeInTheDocument()
  })

  it("shows 0 for stats when data is undefined", () => {
    mockUseAdminDashboard.mockReturnValue({ data: undefined, isLoading: false })
    render(<AdminDashboardPage />)
    expect(screen.getAllByText("0")).toHaveLength(4)
  })

})