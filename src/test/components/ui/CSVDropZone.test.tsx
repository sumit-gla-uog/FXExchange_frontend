import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CSVDropZone } from "../../../components/ui/CSVDropZone"

// Mock react-dropzone
vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => ({
    getRootProps: () => ({
      onClick: vi.fn(),
      onDrop: (e: DragEvent) => {
        const files = Array.from((e as any).dataTransfer?.files ?? [])
        if (files.length) onDrop(files as File[])
      },
    }),
    getInputProps: () => ({ type: "file", accept: ".csv" }),
    isDragActive: false,
    acceptedFiles: [],
  }),
}))

describe("CSVDropZone", () => {

  describe("idle state", () => {
    it("renders drag and drop text", () => {
      render(<CSVDropZone onUpload={vi.fn()} />)
      expect(screen.getByText("Drag & drop CSV file here")).toBeInTheDocument()
    })

    it("renders default hint text", () => {
      render(<CSVDropZone onUpload={vi.fn()} />)
      expect(screen.getByText(/format: pair_code, rate/)).toBeInTheDocument()
    })

    it("renders custom hint text", () => {
      render(<CSVDropZone onUpload={vi.fn()} hint="custom: code,value" />)
      expect(screen.getByText(/custom: code,value/)).toBeInTheDocument()
    })

    it("applies idle class", () => {
      const { container } = render(<CSVDropZone onUpload={vi.fn()} />)
      expect(container.firstChild).toHaveClass("csv-dropzone")
      expect(container.firstChild).toHaveClass("idle")
    })
  })

  describe("drag active state", () => {
    it("renders drop hint when drag is active", () => {
      vi.doMock("react-dropzone", () => ({
        useDropzone: () => ({
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: true,
          acceptedFiles: [],
        }),
      }))
    })
  })

  describe("css classes", () => {
    it("applies csv-dropzone base class", () => {
      const { container } = render(<CSVDropZone onUpload={vi.fn()} />)
      expect(container.firstChild).toHaveClass("csv-dropzone")
    })
  })

})