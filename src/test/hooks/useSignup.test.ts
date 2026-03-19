import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSignup } from "../../hooks/useSignup"

vi.mock("swr/mutation", () => ({
  default: vi.fn(),
}))

import useSWRMutation from "swr/mutation"
const mockUseSWRMutation = vi.mocked(useSWRMutation)

const mockTrigger = vi.fn()

describe("useSignup", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: undefined,
    } as any)
  })

  it("calls useSWRMutation with signup endpoint", () => {
    renderHook(() => useSignup())
    expect(mockUseSWRMutation).toHaveBeenCalledWith(
      "/api/v1/auth/signup/",
      expect.any(Function)
    )
  })

  it("returns isLoading false by default", () => {
    const { result } = renderHook(() => useSignup())
    expect(result.current.isLoading).toBe(false)
  })

  it("returns isLoading true when mutating", () => {
    mockUseSWRMutation.mockReturnValue({ trigger: mockTrigger, isMutating: true, error: undefined } as any)
    const { result } = renderHook(() => useSignup())
    expect(result.current.isLoading).toBe(true)
  })

  it("returns null error by default", () => {
    const { result } = renderHook(() => useSignup())
    expect(result.current.error).toBeNull()
  })

  it("returns error message when error exists", () => {
    mockUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      isMutating: false,
      error: new Error("username already exists"),
    } as any)
    const { result } = renderHook(() => useSignup())
    expect(result.current.error).toBe("username already exists")
  })

  it("calls trigger with payload on signup", async () => {
    mockTrigger.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useSignup())
    await act(async () => {
      await result.current.signup({
        username: "sumit",
        email: "sumit@test.com",
        password: "pass123",
        role: "customer",
      })
    })
    expect(mockTrigger).toHaveBeenCalledWith({
      username: "sumit",
      email: "sumit@test.com",
      password: "pass123",
      role: "customer",
    })
  })

  it("calls trigger with admin role", async () => {
    mockTrigger.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useSignup())
    await act(async () => {
      await result.current.signup({
        username: "admin1",
        email: "admin@test.com",
        password: "pass123",
        role: "admin",
      })
    })
    expect(mockTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" })
    )
  })

  it("throws when trigger fails", async () => {
    mockTrigger.mockRejectedValue(new Error("Signup failed"))
    const { result } = renderHook(() => useSignup())
    await expect(
      act(async () => { await result.current.signup({ username: "x", email: "x@x.com", password: "x", role: "customer" }) })
    ).rejects.toThrow("Signup failed")
  })

})