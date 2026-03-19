// src/test/mocks.ts
// Shared mock factories used across all test files

// ── SWR ──────────────────────────────────────────────────────────────────────
// Usage in test: vi.mock("swr", () => mockSwr({ data: {...}, isLoading: false }))
export const mockUseSWR = (overrides: { data?: any; isLoading?: boolean; error?: any } = {}) => ({
    default: vi.fn().mockReturnValue({
      data: overrides.data ?? undefined,
      isLoading: overrides.isLoading ?? false,
      error: overrides.error ?? undefined,
      mutate: vi.fn(),
    }),
    mutate: vi.fn(),
  })
  
  // ── React Router ──────────────────────────────────────────────────────────────
  export const mockNavigate = vi.fn()
  export const mockUseNavigate = () => mockNavigate
  export const mockUseLocation = () => ({ pathname: "/admin/dashboard" })
  export const mockUseParams   = () => ({ id: "1" })
  
  // ── apiFetch ──────────────────────────────────────────────────────────────────
  export const mockApiFetch = vi.fn().mockResolvedValue({})
  
  // ── AG Grid ───────────────────────────────────────────────────────────────────
  // Lightweight stub — avoids full AG Grid DOM rendering in tests
  export const MockAgGridReact = () => <div data-testid="ag-grid-mock" />
  
  // ── ICellRendererParams ───────────────────────────────────────────────────────
  export const makeCellParams = (overrides: Record<string, any> = {}) => ({
    value: overrides.value ?? "test",
    data: overrides.data ?? {},
    node: {},
    colDef: {},
    column: {},
    api: {},
    context: {},
    eGridCell: document.createElement("div"),
    eParentOfValue: document.createElement("div"),
    getValue: vi.fn(),
    setValue: vi.fn(),
    formatValue: vi.fn(),
    refreshCell: vi.fn(),
    ...overrides,
  })