import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAdminDashboard } from "../../../hooks/admin/useAdminDashboard"

vi.mock("swr", () => ({
  default: vi.fn(),
}))

vi.mock("../../../api/swr", () => ({
  fetcher: vi.fn(),
}))

import useSWR from "swr"

const mockUseSWR = vi.mocked(useSWR)

describe("useAdminDashboard", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns data when loaded", () => {
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
    mockUseSWR.mockReturnValue({ data: mockData, isLoading: false, error: undefined } as any)

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.data).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
  })

  it("returns isLoading true while fetching", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as any)

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it("returns undefined data on error", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false, error: new Error("Network error") } as any)

    const { result } = renderHook(() => useAdminDashboard())

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it("calls useSWR with correct endpoint", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false } as any)

    renderHook(() => useAdminDashboard())

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/v1/admin/dashboard/",
      expect.any(Function)
    )
  })

})