import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDeposit } from "../../../hooks/customer/useDeposit"

vi.mock("swr/mutation", () => ({ default: vi.fn() }))
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>()
  return { ...actual, mutate: vi.fn() }
})

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

})