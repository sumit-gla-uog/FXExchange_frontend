import { describe, it, expect, vi, beforeEach } from "vitest"
import { login, logout, me } from "../../api/auth"

vi.mock("../../api/client", () => ({
  apiFetch:    vi.fn(),
  setTokens:   vi.fn(),
  clearTokens: vi.fn(),
}))

import { apiFetch, setTokens, clearTokens } from "../../api/client"
const mockApiFetch    = vi.mocked(apiFetch)
const mockSetTokens   = vi.mocked(setTokens)
const mockClearTokens = vi.mocked(clearTokens)

describe("auth", () => {

  beforeEach(() => { vi.clearAllMocks() })

  describe("login", () => {
    const mockTokens = { access: "acc123", refresh: "ref456" }

    it("calls apiFetch with login endpoint", async () => {
      mockApiFetch.mockResolvedValue(mockTokens)
      await login("sumit", "password123")
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/login/",
        expect.objectContaining({ method: "POST" })
      )
    })

    it("sends username and password in body", async () => {
      mockApiFetch.mockResolvedValue(mockTokens)
      await login("sumit", "password123")
      const body = JSON.parse((mockApiFetch.mock.calls[0][1] as any).body)
      expect(body.username).toBe("sumit")
      expect(body.password).toBe("password123")
    })

    it("calls setTokens with returned tokens", async () => {
      mockApiFetch.mockResolvedValue(mockTokens)
      await login("sumit", "password123")
      expect(mockSetTokens).toHaveBeenCalledWith(mockTokens)
    })

    it("returns tokens", async () => {
      mockApiFetch.mockResolvedValue(mockTokens)
      const result = await login("sumit", "password123")
      expect(result).toEqual(mockTokens)
    })

    it("throws when apiFetch fails", async () => {
      mockApiFetch.mockRejectedValue(new Error("Invalid credentials"))
      await expect(login("sumit", "wrong")).rejects.toThrow("Invalid credentials")
    })
  })

  describe("logout", () => {
    it("calls clearTokens", async () => {
      await logout()
      expect(mockClearTokens).toHaveBeenCalledTimes(1)
    })

    it("does not call apiFetch", async () => {
      await logout()
      expect(mockApiFetch).not.toHaveBeenCalled()
    })
  })

  describe("me", () => {
    const mockUser = { user: { id: 1, username: "sumit", email: "sumit@test.com", role: "admin" } }

    it("calls apiFetch with me endpoint", async () => {
      mockApiFetch.mockResolvedValue(mockUser)
      await me()
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/me/",
        expect.objectContaining({ method: "GET", auth: true })
      )
    })

    it("returns user data", async () => {
      mockApiFetch.mockResolvedValue(mockUser)
      const result = await me()
      expect(result).toEqual(mockUser)
    })

    it("throws when not authenticated", async () => {
      mockApiFetch.mockRejectedValue(new Error("Session expired. Please login again."))
      await expect(me()).rejects.toThrow("Session expired")
    })
  })

})