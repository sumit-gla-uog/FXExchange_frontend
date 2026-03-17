import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SettingsPage } from "../../../pages/customer/SettingsPage"

describe("SettingsPage", () => {
  it("renders without crashing", () => {
    render(<SettingsPage />)
    expect(screen.getByText("SettingsPage")).toBeInTheDocument()
  })
})