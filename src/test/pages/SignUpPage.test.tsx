import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SignupPage } from "../../pages/SignupPage"

vi.mock("../../hooks/useSignup", () => ({ useSignup: vi.fn() }))
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }))

import { useSignup } from "../../hooks/useSignup"
const mockUseSignup = vi.mocked(useSignup)
const mockNavigate  = vi.fn()
const mockSignup    = vi.fn()

const defaultHook = {
  signup: mockSignup,
  isLoading: false,
  error: null,
}

describe("SignupPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSignup.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders FX Exchange heading", () => {
      render(<SignupPage />)
      expect(screen.getByText("FX Exchange")).toBeInTheDocument()
    })

    it("renders Create Account heading", () => {
      render(<SignupPage />)
      expect(screen.getByText("Create Account")).toBeInTheDocument()
    })

    it("renders username field", () => {
      render(<SignupPage />)
      expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument()
    })

    it("renders email field", () => {
      render(<SignupPage />)
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument()
    })

    it("renders password field", () => {
      render(<SignupPage />)
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument()
    })

    it("renders confirm password field", () => {
      render(<SignupPage />)
      expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument()
    })

    it("renders Account Type label", () => {
      render(<SignupPage />)
      expect(screen.getByText("Account Type")).toBeInTheDocument()
    })

    it("renders Customer and Admin role buttons", () => {
      render(<SignupPage />)
      expect(screen.getByText("Customer")).toBeInTheDocument()
      expect(screen.getByText("Admin")).toBeInTheDocument()
    })

    it("renders Sign Up submit button", () => {
      render(<SignupPage />)
      expect(document.querySelector(".signup-submit-btn")).toBeInTheDocument()
      expect(document.querySelector(".signup-submit-btn")?.textContent).toBe("Sign Up")
    })

    it("renders login link", () => {
      render(<SignupPage />)
      expect(screen.getByText("Login")).toBeInTheDocument()
    })

    it("renders disclaimer text", () => {
      render(<SignupPage />)
      expect(screen.getByText(/simulated trading platform/)).toBeInTheDocument()
    })
  })

  describe("role selection", () => {
    it("Customer has teal background by default", () => {
      render(<SignupPage />)
      expect(screen.getByText("Customer")).toHaveStyle({ background: "#0f766e" })
    })

    it("Admin has light background by default", () => {
      render(<SignupPage />)
      expect(screen.getByText("Admin")).toHaveStyle({ background: "#f9fafb" })
    })

    it("clicking Admin gives it teal background", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Admin"))
      expect(screen.getByText("Admin")).toHaveStyle({ background: "#0f766e" })
    })

    it("clicking Admin removes teal from Customer", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Admin"))
      expect(screen.getByText("Customer")).toHaveStyle({ background: "#f9fafb" })
    })

    it("clicking Customer again restores Customer as selected", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Admin"))
      fireEvent.click(screen.getByText("Customer"))
      expect(screen.getByText("Customer")).toHaveStyle({ background: "#0f766e" })
    })
  })

  describe("password visibility toggle", () => {
    it("renders Show button by default", () => {
      render(<SignupPage />)
      expect(screen.getByText("Show")).toBeInTheDocument()
    })

    it("shows Hide button after clicking Show", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Show"))
      expect(screen.getByText("Hide")).toBeInTheDocument()
    })

    it("shows Show button again after clicking Hide", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Show"))
      fireEvent.click(screen.getByText("Hide"))
      expect(screen.getByText("Show")).toBeInTheDocument()
    })
  })

  // helper, fills all required fields
  const fillForm = (role: "customer" | "admin" = "customer") => {
    fireEvent.change(screen.getByPlaceholderText("Enter username"), { target: { value: "sumit" } })
    fireEvent.change(screen.getByPlaceholderText("Enter email"),    { target: { value: "sumit@test.com" } })
    fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: "pass123" } })
    fireEvent.change(screen.getByPlaceholderText("Confirm password"),{ target: { value: "pass123" } })
    if (role === "admin") fireEvent.click(screen.getByText("Admin"))
  }

  describe("form submission", () => {
    it("calls signup on form submit", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled()
      })
    })

    it("submits with customer role by default", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm("customer")
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(
          expect.objectContaining({ role: "customer" })
        )
      })
    })

    it("submits with admin role when Admin selected", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm("admin")
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(
          expect.objectContaining({ role: "admin" })
        )
      })
    })

    it("shows success message after signup", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText("Account created successfully!")).toBeInTheDocument()
      })
    })

    it("shows redirecting text after success", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.getByText("Redirecting to login...")).toBeInTheDocument()
      })
    })

    it("hides form after success", async () => {
      mockSignup.mockResolvedValue({})
      render(<SignupPage />)
      fillForm()
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Enter username")).not.toBeInTheDocument()
      })
    })
  })

  describe("error state", () => {
    it("shows server error message", () => {
      mockUseSignup.mockReturnValue({ ...defaultHook, error: "username already exists" })
      render(<SignupPage />)
      expect(screen.getByText("username already exists")).toBeInTheDocument()
    })

    it("shows different server error messages", () => {
      mockUseSignup.mockReturnValue({ ...defaultHook, error: "Email already in use" })
      render(<SignupPage />)
      expect(screen.getByText("Email already in use")).toBeInTheDocument()
    })
  })

  describe("loading state", () => {
    it("shows Creating account text when loading", () => {
      mockUseSignup.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<SignupPage />)
      expect(document.querySelector(".signup-submit-btn")?.textContent).toBe("Creating account...")
    })

    it("disables submit button when loading", () => {
      mockUseSignup.mockReturnValue({ ...defaultHook, isLoading: true })
      render(<SignupPage />)
      expect(document.querySelector(".signup-submit-btn")).toBeDisabled()
    })

    it("submit button is enabled when not loading", () => {
      render(<SignupPage />)
      expect(document.querySelector(".signup-submit-btn")).not.toBeDisabled()
    })
  })

  describe("navigation", () => {
    it("navigates to /login when Login link clicked", () => {
      render(<SignupPage />)
      fireEvent.click(screen.getByText("Login"))
      expect(mockNavigate).toHaveBeenCalledWith("/login")
    })
  })

})