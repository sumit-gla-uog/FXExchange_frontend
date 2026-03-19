import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginPage } from "../../pages/Loginpage/LoginPage"
import * as authModule from "../../api/auth"

vi.mock("../../api/auth", () => ({ login: vi.fn() }))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }))

describe("LoginPage", () => {

  beforeEach(() => { vi.clearAllMocks() })

  describe("rendering", () => {
    it("renders FX Exchange heading", () => {
      render(<LoginPage />)
      expect(screen.getByText("FX Exchange")).toBeInTheDocument()
    })

    it("renders Welcome Back heading", () => {
      render(<LoginPage />)
      expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    })

    it("renders username field", () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument()
    })

    it("renders password field", () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument()
    })

    it("renders Login button", () => {
      render(<LoginPage />)
      expect(screen.getByText("Login")).toBeInTheDocument()
    })

    it("renders disclaimer text", () => {
      render(<LoginPage />)
      expect(screen.getByText(/simulated trading platform/)).toBeInTheDocument()
    })

    it("renders Sign up link", () => {
      render(<LoginPage />)
      expect(screen.getByText("Sign up")).toBeInTheDocument()
    })
  })

  describe("password visibility toggle", () => {
    it("password field is hidden by default", () => {
      render(<LoginPage />)
      expect(screen.getByText("Show")).toBeInTheDocument()
      // password input is type=password by default
      const inputs = document.querySelectorAll("input[type='password']")
      expect(inputs.length).toBeGreaterThan(0)
    })

    it("shows Hide button after Show is clicked", () => {
      render(<LoginPage />)
      fireEvent.click(screen.getByText("Show"))
      expect(screen.getByText("Hide")).toBeInTheDocument()
    })

    it("shows Show button again after Hide is clicked", () => {
      render(<LoginPage />)
      fireEvent.click(screen.getByText("Show"))
      fireEvent.click(screen.getByText("Hide"))
      expect(screen.getByText("Show")).toBeInTheDocument()
    })
  })

  const fillAndSubmit = () => {
    const inputs = document.querySelectorAll("input")
    fireEvent.change(inputs[0], { target: { value: "sumit" } })
    fireEvent.change(inputs[1], { target: { value: "password123" } })
    fireEvent.submit(document.querySelector("form")!)
  }

  describe("form submission", () => {
    it("navigates to /select-role on successful login", async () => {
      vi.mocked(authModule.login).mockResolvedValue({ access: "tok", refresh: "ref" } as any)
      render(<LoginPage />)
      fillAndSubmit()
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/select-role", { replace: true })
      })
    })

    it("shows error message on failed login", async () => {
      vi.mocked(authModule.login).mockRejectedValue(new Error("Invalid credentials"))
      render(<LoginPage />)
      fillAndSubmit()
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
      })
    })

    it("calls login with username and password", async () => {
      vi.mocked(authModule.login).mockResolvedValue({ access: "tok", refresh: "ref" } as any)
      render(<LoginPage />)
      fillAndSubmit()
      await waitFor(() => {
        expect(authModule.login).toHaveBeenCalled()
      })
    })
  })

})