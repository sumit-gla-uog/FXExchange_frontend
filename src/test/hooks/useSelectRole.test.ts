import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSelectRole } from "../../hooks/useSelectRole"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))
vi.mock("@/api/client", () => ({ getAccessToken: vi.fn().mockReturnValue("mock-token") }))
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }))

import useSWR from "swr"

const mockUseSWR   = vi.mocked(useSWR)
const mockNavigate = vi.fn()

describe("useSelectRole", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe("data", () => {
    it("returns username from me endpoint", () => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "sumit", role: "customer" } }, isLoading: false } as any)
      const { result } = renderHook(() => useSelectRole())
      expect(result.current.username).toBe("sumit")
    })

    it("returns empty username when loading", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => useSelectRole())
      expect(result.current.username).toBe("")
    })

    it("returns isAdmin false for customer role", () => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "sumit", role: "customer" } }, isLoading: false } as any)
      const { result } = renderHook(() => useSelectRole())
      expect(result.current.isAdmin).toBe(false)
    })

    it("returns isAdmin true for admin role", () => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "admin1", role: "admin" } }, isLoading: false } as any)
      const { result } = renderHook(() => useSelectRole())
      expect(result.current.isAdmin).toBe(true)
    })

    it("returns isLoading true while fetching", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => useSelectRole())
      expect(result.current.isLoading).toBe(true)
    })

    it("calls me endpoint when token exists", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: false } as any)
      renderHook(() => useSelectRole())
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/auth/me/", expect.any(Function))
    })

    it("passes null to useSWR when no token", async () => {
      const { getAccessToken } = await import("@/api/client")
      vi.mocked(getAccessToken).mockReturnValue(null)
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: false } as any)
      renderHook(() => useSelectRole())
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function))
    })
  })

  describe("pick", () => {
    beforeEach(() => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "sumit", role: "customer" } }, isLoading: false } as any)
    })

    it("navigates to /customer when customer picked", () => {
      const { result } = renderHook(() => useSelectRole())
      act(() => { result.current.pick("customer") })
      expect(mockNavigate).toHaveBeenCalledWith("/customer", { replace: true })
    })

    it("stores active_role in localStorage for customer", () => {
      const { result } = renderHook(() => useSelectRole())
      act(() => { result.current.pick("customer") })
      expect(localStorage.getItem("active_role")).toBe("customer")
    })

    it("alerts and does not navigate when non-admin picks admin", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
      const { result } = renderHook(() => useSelectRole())
      act(() => { result.current.pick("admin") })
      expect(alertSpy).toHaveBeenCalledWith("You don't have admin access.")
      expect(mockNavigate).not.toHaveBeenCalled()
      alertSpy.mockRestore()
    })

    it("navigates to /admin when admin user picks admin", () => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "admin1", role: "admin" } }, isLoading: false } as any)
      const { result } = renderHook(() => useSelectRole())
      act(() => { result.current.pick("admin") })
      expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true })
    })

    it("stores active_role in localStorage for admin", () => {
      mockUseSWR.mockReturnValue({ data: { user: { username: "admin1", role: "admin" } }, isLoading: false } as any)
      const { result } = renderHook(() => useSelectRole())
      act(() => { result.current.pick("admin") })
      expect(localStorage.getItem("active_role")).toBe("admin")
    })
  })

})