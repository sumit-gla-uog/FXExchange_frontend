import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useIsMobile } from "../../hooks/UseIsMobile"

describe("useIsMobile", () => {

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width })
  }

  beforeEach(() => {
    setWindowWidth(1024)
  })

  afterEach(() => {
    setWindowWidth(1024)
  })

  describe("initial value", () => {
    it("returns false when window width is above default breakpoint", () => {
      setWindowWidth(1024)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })

    it("returns true when window width is below default breakpoint", () => {
      setWindowWidth(500)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it("returns true when window width equals breakpoint minus 1", () => {
      setWindowWidth(767)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it("returns false when window width equals breakpoint exactly", () => {
      setWindowWidth(768)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })
  })

  describe("custom breakpoint", () => {
    it("uses custom breakpoint of 1024", () => {
      setWindowWidth(900)
      const { result } = renderHook(() => useIsMobile(1024))
      expect(result.current).toBe(true)
    })

    it("returns false when above custom breakpoint", () => {
      setWindowWidth(1200)
      const { result } = renderHook(() => useIsMobile(1024))
      expect(result.current).toBe(false)
    })

    it("uses custom breakpoint of 480", () => {
      setWindowWidth(400)
      const { result } = renderHook(() => useIsMobile(480))
      expect(result.current).toBe(true)
    })
  })

  describe("resize behaviour", () => {
    it("updates to true when resized below breakpoint", () => {
      setWindowWidth(1024)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)

      act(() => {
        setWindowWidth(400)
        window.dispatchEvent(new Event("resize"))
      })

      expect(result.current).toBe(true)
    })

    it("updates to false when resized above breakpoint", () => {
      setWindowWidth(400)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)

      act(() => {
        setWindowWidth(1200)
        window.dispatchEvent(new Event("resize"))
      })

      expect(result.current).toBe(false)
    })

    it("does not update when resized but stays on same side", () => {
      setWindowWidth(1024)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)

      act(() => {
        setWindowWidth(900)
        window.dispatchEvent(new Event("resize"))
      })

      expect(result.current).toBe(false)
    })
  })

  describe("cleanup", () => {
    it("removes resize event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener")
      const { unmount } = renderHook(() => useIsMobile())
      unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })

})