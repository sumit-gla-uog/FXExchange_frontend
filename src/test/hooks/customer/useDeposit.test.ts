import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

vi.mock("swr/mutation", () => ({ default: vi.fn() }))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})

import { useDeposit } from "../../../hooks/customer/useDeposit"
import useSWRMutation from "swr/mutation"
import { mutate } from "swr"

const mockUseSWRMutation = vi.mocked(useSWRMutation)
const mockMutate         = vi.mocked(mutate)
const mockTrigger        = vi.fn()

const mockPayload = {
  amount: "1000",
  bank_name: "HSBC",
  account_number: "12345678",
  sort_code: "12-34-56",
}

const mockResult = {
  ok: true,
  message: "Successfully deposited 1000 GBP",
  deposit: { amount: "1000", currency: "GBP", new_balance: "11000" },
}

describe("useDeposit", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
    } as any)
  })

  // hook wiring
  it("calls useSWRMutation with deposit endpoint", () => {
    renderHook(() => useDeposit())
    expect(mockUseSWRMutation).toHaveBeenCalledWith(
      "/api/v1/portfolio/deposit/",
      expect.any(Function)
    )
  })

  it("returns isLoading false by default", () => {
    const { result } = renderHook(() => useDeposit())
    expect(result.current.isLoading).toBe(false)
  })

  it("returns isLoading true when mutating", () => {
    mockUseSWRMutation.mockReturnValue({ trigger: mockTrigger, isMutating: true, error: undefined } as any)
    const { result } = renderHook(() => useDeposit())
    expect(result.current.isLoading).toBe(true)
  })

  it("returns null error by default", () => {
    const { result } = renderHook(() => useDeposit())
    expect(result.current.error).toBeNull()
  })

  it("returns error message when error exists", () => {
    mockUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: new Error("Deposit failed"),
    } as any)
    const { result } = renderHook(() => useDeposit())
    expect(result.current.error).toBe("Deposit failed")
  })

  it("calls trigger with payload on deposit", async () => {
    mockTrigger.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useDeposit())
    await act(async () => { await result.current.deposit(mockPayload) })
    expect(mockTrigger).toHaveBeenCalledWith(mockPayload)
  })

  it("returns deposit result", async () => {
    mockTrigger.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useDeposit())
    let depositResult: any
    await act(async () => { depositResult = await result.current.deposit(mockPayload) })
    expect(depositResult).toEqual(mockResult)
  })

  it("mutates portfolio after deposit", async () => {
    mockTrigger.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useDeposit())
    await act(async () => { await result.current.deposit(mockPayload) })
    expect(mockMutate).toHaveBeenCalledWith("/api/v1/portfolio/")
  })

  it("mutates dashboard summary after deposit", async () => {
    mockTrigger.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useDeposit())
    await act(async () => { await result.current.deposit(mockPayload) })
    expect(mockMutate).toHaveBeenCalledWith("/api/v1/dashboard/summary/")
  })

  it("throws when trigger fails", async () => {
    mockTrigger.mockRejectedValue(new Error("amount must be positive"))
    const { result } = renderHook(() => useDeposit())
    await expect(
      act(async () => { await result.current.deposit(mockPayload) })
    ).rejects.toThrow("amount must be positive")
  })

  // depositFetcher direct tests (lines 22-36)
  describe("depositFetcher (via trigger call)", () => {

    it("fetcher makes POST request to deposit URL", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
      vi.stubGlobal("fetch", mockFetch)

      let capturedFetcher: any
      mockUseSWRMutation.mockImplementation((url, fetcher) => {
        capturedFetcher = fetcher
        return { trigger: mockTrigger, isMutating: false, error: undefined } as any
      })

      renderHook(() => useDeposit())
      await capturedFetcher("/api/v1/portfolio/deposit/", { arg: mockPayload })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/portfolio/deposit/"),
        expect.objectContaining({ method: "POST" })
      )
      vi.unstubAllGlobals()
    })

    it("fetcher sends Authorization header", async () => {
      localStorage.setItem("access_token", "test-token")
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
      vi.stubGlobal("fetch", mockFetch)

      let capturedFetcher: any
      mockUseSWRMutation.mockImplementation((url, fetcher) => {
        capturedFetcher = fetcher
        return { trigger: mockTrigger, isMutating: false, error: undefined } as any
      })

      renderHook(() => useDeposit())
      await capturedFetcher("/api/v1/portfolio/deposit/", { arg: mockPayload })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      )
      vi.unstubAllGlobals()
      localStorage.removeItem("access_token")
    })

    it("fetcher returns data on success", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
      vi.stubGlobal("fetch", mockFetch)

      let capturedFetcher: any
      mockUseSWRMutation.mockImplementation((url, fetcher) => {
        capturedFetcher = fetcher
        return { trigger: mockTrigger, isMutating: false, error: undefined } as any
      })

      renderHook(() => useDeposit())
      const result = await capturedFetcher("/api/v1/portfolio/deposit/", { arg: mockPayload })
      expect(result).toEqual(mockResult)
      vi.unstubAllGlobals()
    })

    it("fetcher throws on non-ok response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "amount must be a positive number" }),
      })
      vi.stubGlobal("fetch", mockFetch)

      let capturedFetcher: any
      mockUseSWRMutation.mockImplementation((url, fetcher) => {
        capturedFetcher = fetcher
        return { trigger: mockTrigger, isMutating: false, error: undefined } as any
      })

      renderHook(() => useDeposit())
      await expect(
        capturedFetcher("/api/v1/portfolio/deposit/", { arg: mockPayload })
      ).rejects.toThrow("amount must be a positive number")
      vi.unstubAllGlobals()
    })

    it("fetcher throws generic error when no error message", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      })
      vi.stubGlobal("fetch", mockFetch)

      let capturedFetcher: any
      mockUseSWRMutation.mockImplementation((url, fetcher) => {
        capturedFetcher = fetcher
        return { trigger: mockTrigger, isMutating: false, error: undefined } as any
      })

      renderHook(() => useDeposit())
      await expect(
        capturedFetcher("/api/v1/portfolio/deposit/", { arg: mockPayload })
      ).rejects.toThrow("Deposit failed")
      vi.unstubAllGlobals()
    })
  })
})