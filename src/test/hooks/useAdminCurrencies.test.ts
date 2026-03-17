import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAdminCurrencies } from "../../../src/hooks/admin/useAdminCurrencies"

vi.mock("swr", () => ({
  default: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock("@/api/swr", () => ({
  fetcher: vi.fn(),
}))

vi.mock("@/api/client", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}))

import useSWR, { mutate } from "swr"
import { apiFetch } from "../../../src/api/client"

const mockUseSWR    = vi.mocked(useSWR)
const mockMutate    = vi.mocked(mutate)
const mockApiFetch  = vi.mocked(apiFetch)

const mockCurrencies = [
  { id: 1, code: "USD", name: "US Dollar",  symbol: "$", flag: "usd", enabled: true },
  { id: 2, code: "EUR", name: "Euro",        symbol: "€", flag: "euro", enabled: false },
]

describe("useAdminCurrencies", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR.mockReturnValue({ data: { currencies: mockCurrencies }, isLoading: false } as any)
  })

  describe("data fetching", () => {
    it("returns currencies list", () => {
      const { result } = renderHook(() => useAdminCurrencies())
      expect(result.current.currencies).toEqual(mockCurrencies)
    })

    it("returns empty array when data is undefined", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => useAdminCurrencies())
      expect(result.current.currencies).toEqual([])
    })

    it("returns isLoading true while fetching", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => useAdminCurrencies())
      expect(result.current.isLoading).toBe(true)
    })

    it("calls useSWR with correct endpoint", () => {
      renderHook(() => useAdminCurrencies())
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/admin/currencies/", expect.any(Function))
    })
  })

  describe("handleAdd", () => {
    const newCurrency = { code: "jpy", name: "Japanese Yen", symbol: "¥", flag: "yen" }

    it("calls apiFetch with correct endpoint and method", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleAdd(newCurrency) })
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/admin/currencies/add/",
        expect.objectContaining({ method: "POST", auth: true })
      )
    })

    it("uppercases the currency code", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleAdd(newCurrency) })
      const body = JSON.parse((mockApiFetch.mock.calls[0][1] as any).body)
      expect(body.code).toBe("JPY")
    })

    it("calls mutate to revalidate after add", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleAdd(newCurrency) })
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/currencies/")
    })

    it("throws when apiFetch fails", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Server error"))
      const { result } = renderHook(() => useAdminCurrencies())
      await expect(result.current.handleAdd(newCurrency)).rejects.toThrow("Server error")
    })
  })

  describe("handleToggle", () => {
    it("calls apiFetch with correct toggle endpoint", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleToggle(1) })
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/admin/currencies/1/toggle/",
        expect.objectContaining({ method: "PATCH", auth: true })
      )
    })

    it("calls mutate to revalidate after toggle", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleToggle(1) })
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/currencies/")
    })

    it("uses correct id in endpoint", async () => {
      const { result } = renderHook(() => useAdminCurrencies())
      await act(async () => { await result.current.handleToggle(42) })
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/admin/currencies/42/toggle/",
        expect.any(Object)
      )
    })

    it("throws when apiFetch fails", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Toggle failed"))
      const { result } = renderHook(() => useAdminCurrencies())
      await expect(result.current.handleToggle(1)).rejects.toThrow("Toggle failed")
    })
  })

})