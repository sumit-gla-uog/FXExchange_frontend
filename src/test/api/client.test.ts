import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getAccessToken, setTokens, clearTokens, apiFetch } from "../../api/client"

describe("client", () => {

  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  //token helpers
  describe("getAccessToken", () => {
    it("returns null when no token stored", () => {
      expect(getAccessToken()).toBeNull()
    })

    it("returns stored access token", () => {
      localStorage.setItem("access_token", "abc123")
      expect(getAccessToken()).toBe("abc123")
    })
  })

  describe("setTokens", () => {
    it("stores access and refresh tokens", () => {
      setTokens({ access: "acc", refresh: "ref" })
      expect(localStorage.getItem("access_token")).toBe("acc")
      expect(localStorage.getItem("refresh_token")).toBe("ref")
    })
  })

  describe("clearTokens", () => {
    it("removes both tokens", () => {
      localStorage.setItem("access_token", "acc")
      localStorage.setItem("refresh_token", "ref")
      clearTokens()
      expect(localStorage.getItem("access_token")).toBeNull()
      expect(localStorage.getItem("refresh_token")).toBeNull()
    })
  })

  describe("apiFetch", () => {
    const mockOkResponse = (data: any) =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(data)),
      } as Response)

    const mockErrorResponse = (status: number, data: any) =>
      Promise.resolve({
        ok: false,
        status,
        text: () => Promise.resolve(JSON.stringify(data)),
      } as Response)

    it("makes a GET request to correct URL", async () => {
      vi.mocked(fetch).mockReturnValue(mockOkResponse({ data: "ok" }))
      await apiFetch("/api/v1/test/")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/test/"),
        expect.any(Object)
      )
    })

    it("sets Content-Type header to application/json", async () => {
      vi.mocked(fetch).mockReturnValue(mockOkResponse({}))
      await apiFetch("/api/v1/test/")
      const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers
      expect(headers.get("Content-Type")).toBe("application/json")
    })

    it("sets Authorization header when auth is true", async () => {
      localStorage.setItem("access_token", "mytoken")
      vi.mocked(fetch).mockReturnValue(mockOkResponse({}))
      await apiFetch("/api/v1/test/", { auth: true })
      const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers
      expect(headers.get("Authorization")).toBe("Bearer mytoken")
    })

    it("does not set Authorization header when auth is false", async () => {
      localStorage.setItem("access_token", "mytoken")
      vi.mocked(fetch).mockReturnValue(mockOkResponse({}))
      await apiFetch("/api/v1/test/", { auth: false })
      const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers
      expect(headers.get("Authorization")).toBeNull()
    })

    it("returns parsed JSON response", async () => {
      vi.mocked(fetch).mockReturnValue(mockOkResponse({ user: "sumit" }))
      const result = await apiFetch("/api/v1/test/")
      expect(result).toEqual({ user: "sumit" })
    })

    it("returns null for empty response body", async () => {
      vi.mocked(fetch).mockReturnValue(
        Promise.resolve({ ok: true, status: 204, text: () => Promise.resolve("") } as Response)
      )
      const result = await apiFetch("/api/v1/test/")
      expect(result).toBeNull()
    })

    it("throws error with detail message on failure", async () => {
      vi.mocked(fetch).mockReturnValue(mockErrorResponse(400, { detail: "Bad request" }))
      await expect(apiFetch("/api/v1/test/")).rejects.toThrow("Bad request")
    })

    it("throws error with error field on failure", async () => {
      vi.mocked(fetch).mockReturnValue(mockErrorResponse(400, { error: "Invalid data" }))
      await expect(apiFetch("/api/v1/test/")).rejects.toThrow("Invalid data")
    })

    it("throws generic error with status code when no message", async () => {
      vi.mocked(fetch).mockReturnValue(mockErrorResponse(500, {}))
      await expect(apiFetch("/api/v1/test/")).rejects.toThrow("Request failed (500)")
    })

    describe("401 auto-refresh", () => {
      it("throws session expired when no refresh token", async () => {
        vi.mocked(fetch).mockReturnValue(
          Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve("{}") } as Response)
        )
        await expect(apiFetch("/api/v1/test/", { auth: true })).rejects.toThrow("Session expired")
      })

      it("retries with new token after successful refresh", async () => {
        localStorage.setItem("refresh_token", "ref123")
        vi.mocked(fetch)
          .mockReturnValueOnce(Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve("{}") } as Response))
          .mockReturnValueOnce(Promise.resolve({ ok: true,  status: 200, json: () => Promise.resolve({ access: "newtoken" }) } as Response))
          .mockReturnValueOnce(Promise.resolve({ ok: true,  status: 200, text: () => Promise.resolve(JSON.stringify({ data: "ok" })) } as Response))

        const result = await apiFetch("/api/v1/test/", { auth: true })
        expect(result).toEqual({ data: "ok" })
        expect(localStorage.getItem("access_token")).toBe("newtoken")
      })

      it("clears tokens and redirects when refresh fails", async () => {
        localStorage.setItem("access_token",  "old")
        localStorage.setItem("refresh_token", "ref123")

        const assignSpy = vi.fn()
        Object.defineProperty(window, "location", {
          value: { href: "" },
          writable: true,
        })

        vi.mocked(fetch)
          .mockReturnValueOnce(Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve("{}") } as Response))
          .mockReturnValueOnce(Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) } as Response))

        await expect(apiFetch("/api/v1/test/", { auth: true })).rejects.toThrow("Session expired")
        expect(localStorage.getItem("access_token")).toBeNull()
        expect(localStorage.getItem("refresh_token")).toBeNull()
      })
    })
  })

})