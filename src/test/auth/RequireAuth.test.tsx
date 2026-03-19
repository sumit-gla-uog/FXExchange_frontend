import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("../../api/client", () => ({
  getAccessToken: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  useLocation: () => ({ pathname: "/customer/dashboard" }),
}))

import { RequireAuth } from "../../auth/RequireAuth"
import { getAccessToken } from "../../api/client"
const mockGetAccessToken = vi.mocked(getAccessToken)

describe("RequireAuth", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children when token exists", () => {
    mockGetAccessToken.mockReturnValue("valid-token")
    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected</div>
      </RequireAuth>
    )
    expect(screen.getByTestId("protected-content")).toBeInTheDocument()
  })

  it("renders children content correctly", () => {
    mockGetAccessToken.mockReturnValue("valid-token")
    render(
      <RequireAuth>
        <p>Secret page</p>
      </RequireAuth>
    )
    expect(screen.getByText("Secret page")).toBeInTheDocument()
  })

  it("redirects to /login when no token", () => {
    mockGetAccessToken.mockReturnValue(null)
    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected</div>
      </RequireAuth>
    )
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login")
  })

  it("does not render children when no token", () => {
    mockGetAccessToken.mockReturnValue(null)
    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected</div>
      </RequireAuth>
    )
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
  })

  it("redirects when token is empty string", () => {
    mockGetAccessToken.mockReturnValue("")
    render(<RequireAuth><div>Protected</div></RequireAuth>)
    expect(screen.getByTestId("navigate")).toBeInTheDocument()
  })

  it("redirects when token is undefined", () => {
    mockGetAccessToken.mockReturnValue(undefined)
    render(<RequireAuth><div>Protected</div></RequireAuth>)
    expect(screen.getByTestId("navigate")).toBeInTheDocument()
  })
})