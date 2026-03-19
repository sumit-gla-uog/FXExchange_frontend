import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AdminRatesPage } from "../../../pages/admin/AdminRatesPage"

vi.mock("../../../hooks/admin/useAdminRates", () => ({
  useAdminRates: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("ag-grid-react", () => ({
  AgGridReact: () => <div data-testid="ag-grid" />,
}))

vi.mock("../../../components/ui/StatCard", () => ({
  StatCard: ({ label, value }: any) => (
    <div data-testid="stat-card"><span>{label}</span><span>{value}</span></div>
  ),
}))

vi.mock("../../../components/ui/CSVDropZone", () => ({
  CSVDropZone: ({ onUpload }: any) => (
    <button data-testid="csv-dropzone" onClick={() => onUpload(new File([""], "test.csv"))}>
      Upload CSV
    </button>
  ),
}))

import { useAdminRates } from "../../../hooks/admin/useAdminRates"
const mockUseAdminRates = vi.mocked(useAdminRates)

const mockPairs = [
  { id: 1, pair: "GBP/USD", rate: "1.2850" },
  { id: 2, pair: "GBP/EUR", rate: "1.1800" },
]

const mockRates = [
  { id: 1, pair: "GBP/USD", pair_id: 1, rate: "1.2850", source: "api", updated_by: "system", as_of: "2026-03-17T10:00:00Z" },
]

const mockDashData = {
  total_currencies: 11,
  total_rates: 13,
  stale_rates: 2,
  unavailable_rates: 0,
  api_status: "ok",
  last_check: "2026-03-17T10:00:00Z",
  uptime_pct: "99.9",
}

const defaultHook = {
  dashData: mockDashData,
  dashLoading: false,
  rates: mockRates,
  ratesLoading: false,
  pairs: mockPairs,
  handleManualUpdate: vi.fn().mockResolvedValue(undefined),
  handleCsvUpload: vi.fn().mockResolvedValue({ updated: 3, errors: [] }),
  refreshRates: vi.fn(),
}

describe("AdminRatesPage", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAdminRates.mockReturnValue(defaultHook)
  })

  describe("rendering", () => {
    it("renders page title", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("Rate Management")).toBeInTheDocument()
    })

    it("renders back to dashboard button", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument()
    })

    it("renders API Health Status section", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("API Health Status")).toBeInTheDocument()
    })

    it("renders Operational status", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("Operational")).toBeInTheDocument()
    })

    it("renders 3 stat cards", () => {
      render(<AdminRatesPage />)
      expect(screen.getAllByTestId("stat-card")).toHaveLength(3)
    })

    it("renders Manual Rate Update section", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("Manual Rate Update")).toBeInTheDocument()
    })

    it("renders CSV and Manual method cards", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("CSV Import (Recommended)")).toBeInTheDocument()
      expect(screen.getByText("Manual Entry (Emergency)")).toBeInTheDocument()
    })

    it("renders Recent Rate Updates section", () => {
      render(<AdminRatesPage />)
      expect(screen.getByText("Recent Rate Updates")).toBeInTheDocument()
    })

    it("renders ag-grid for rates", () => {
      render(<AdminRatesPage />)
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument()
    })

    it("shows empty message when no rates", () => {
      mockUseAdminRates.mockReturnValue({ ...defaultHook, rates: [] })
      render(<AdminRatesPage />)
      expect(screen.getByText("No rate updates yet.")).toBeInTheDocument()
    })
  })

  describe("method selector", () => {
    it("CSV panel hidden by default", () => {
      render(<AdminRatesPage />)
      expect(screen.queryByText("Upload CSV File")).not.toBeInTheDocument()
    })

    it("Manual panel hidden by default", () => {
      render(<AdminRatesPage />)
      expect(screen.queryByText("Enter Rate Manually")).not.toBeInTheDocument()
    })

    it("shows CSV panel when CSV card clicked", () => {
      render(<AdminRatesPage />)
      fireEvent.click(screen.getByText("CSV Import (Recommended)"))
      expect(screen.getByText("Upload CSV File")).toBeInTheDocument()
    })

    it("shows Manual panel when Manual card clicked", () => {
      render(<AdminRatesPage />)
      fireEvent.click(screen.getByText("Manual Entry (Emergency)"))
      expect(screen.getByText("Enter Rate Manually")).toBeInTheDocument()
    })

    it("toggles CSV panel off when clicked again", () => {
      render(<AdminRatesPage />)
      fireEvent.click(screen.getByText("CSV Import (Recommended)"))
      expect(screen.getByText("Upload CSV File")).toBeInTheDocument()
      fireEvent.click(screen.getByText("CSV Import (Recommended)"))
      expect(screen.queryByText("Upload CSV File")).not.toBeInTheDocument()
    })
  })

  describe("csv upload", () => {
    it("shows upload result after successful upload", async () => {
      render(<AdminRatesPage />)
      fireEvent.click(screen.getByText("CSV Import (Recommended)"))
      fireEvent.click(screen.getByTestId("csv-dropzone"))
      await waitFor(() => {
        expect(screen.getByText(/3 rate\(s\) updated/)).toBeInTheDocument()
      })
    })

    it("shows error count when upload has errors", async () => {
      mockUseAdminRates.mockReturnValue({
        ...defaultHook,
        handleCsvUpload: vi.fn().mockResolvedValue({ updated: 1, errors: [{ error: "Invalid pair" }] }),
      })
      render(<AdminRatesPage />)
      fireEvent.click(screen.getByText("CSV Import (Recommended)"))
      fireEvent.click(screen.getByTestId("csv-dropzone"))
      await waitFor(() => {
        expect(screen.getByText(/1 error\(s\)/)).toBeInTheDocument()
      })
    })
  })

//   describe("manual update", () => {
//     it("shows success message after manual update", async () => {
//         render(<AdminRatesPage />)
//         fireEvent.click(screen.getByText("Manual Entry (Emergency)"))
      
//         const form = document.querySelector("form") as HTMLFormElement
//         fireEvent.submit(form)
      
//         await waitFor(() => {
//           expect(defaultHook.handleManualUpdate).toHaveBeenCalled()
//           expect(screen.getByText("Rate updated successfully")).toBeInTheDocument()
//         })
//       })
      
//       it("shows error message when manual update fails", async () => {
//         mockUseAdminRates.mockReturnValue({
//           ...defaultHook,
//           handleManualUpdate: vi.fn().mockRejectedValue(new Error("Rate update failed")),
//         })
//         render(<AdminRatesPage />)
//         fireEvent.click(screen.getByText("Manual Entry (Emergency)"))
      
//         const form = document.querySelector("form") as HTMLFormElement
//         fireEvent.submit(form)
      
//         await waitFor(() => {
//           expect(screen.getByText("Rate update failed")).toBeInTheDocument()
//         })
//       })
//   })

  describe("refresh", () => {
    it("calls refreshRates when refresh button clicked", () => {
      render(<AdminRatesPage />)
      const refreshBtn = document.querySelector(".rates-card button[appearance='transparent']") ??
        screen.getAllByRole("button").find(b => b.closest(".rates-card"))
      fireEvent.click(screen.getAllByRole("button").find(b => !b.textContent?.trim())!)
      expect(defaultHook.refreshRates).toHaveBeenCalled()
    })
  })

})