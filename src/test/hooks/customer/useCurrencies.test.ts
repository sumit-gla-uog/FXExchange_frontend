import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useCurrencies } from "../../../hooks/customer/useCurrencies"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockCurrencies = [
  { id: 1, code: "USD", name: "US Dollar",  symbol: "$", flag: "usd", enabled: true },
  { id: 2, code: "EUR", name: "Euro",        symbol: "€", flag: "eur", enabled: true },
  { id: 3, code: "JPY", name: "Japanese Yen",symbol: "¥", flag: "jpy", enabled: true },
]

const mockSnapshot = {
  market_snapshot: [
    { pair: "GBP/USD", rate: "1.2850", change_pct: "0.45" },
    { pair: "GBP/EUR", rate: "1.1800", change_pct: "-0.30" },
  ],
}

describe("useCurrencies", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: { currencies: mockCurrencies }, isLoading: false } as any)
      .mockReturnValueOnce({ data: mockSnapshot, isLoading: false } as any)
  })

  describe("data", () => {
    it("returns currencies list", () => {
      const { result } = renderHook(() => useCurrencies(""))
      expect(result.current.currencies).toEqual(mockCurrencies)
    })

    it("returns empty array when data undefined", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => useCurrencies(""))
      expect(result.current.currencies).toEqual([])
    })

    it("returns isLoading true while fetching", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => useCurrencies(""))
      expect(result.current.isLoading).toBe(true)
    })

    it("returns snapshot", () => {
      const { result } = renderHook(() => useCurrencies(""))
      expect(result.current.snapshot).toEqual(mockSnapshot)
    })
  })

  describe("search endpoint", () => {
    it("calls base endpoint when search is empty", () => {
      renderHook(() => useCurrencies(""))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/currencies/", expect.any(Function))
    })

    it("appends search param when search provided", () => {
      renderHook(() => useCurrencies("usd"))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/currencies/?search=usd", expect.any(Function))
    })
  })

  describe("getRateInfo", () => {
    it("returns rate info for currency in snapshot", () => {
      const { result } = renderHook(() => useCurrencies(""))
      const rateInfo = result.current.getRateInfo("USD", mockSnapshot)
      expect(rateInfo?.rate).toBe("1.2850")
      expect(rateInfo?.change_pct).toBe("0.45")
    })

    it("returns null for currency not in snapshot", () => {
      const { result } = renderHook(() => useCurrencies(""))
      const rateInfo = result.current.getRateInfo("JPY", mockSnapshot)
      expect(rateInfo).toBeNull()
    })

    it("returns null when snapshot is undefined", () => {
      const { result } = renderHook(() => useCurrencies(""))
      const rateInfo = result.current.getRateInfo("USD", undefined)
      expect(rateInfo).toBeNull()
    })

    it("matches GBP/CODE pair format", () => {
      const { result } = renderHook(() => useCurrencies(""))
      const eurInfo = result.current.getRateInfo("EUR", mockSnapshot)
      expect(eurInfo?.rate).toBe("1.1800")
    })
  })

})