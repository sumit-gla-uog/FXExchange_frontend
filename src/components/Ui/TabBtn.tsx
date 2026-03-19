import "./TabBtn.css"

interface TabBtnProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

export const TabBtn = ({ label, count, active, onClick }: TabBtnProps) => (
  <button className={`tab-btn ${active ? "active" : ""}`} onClick={onClick}>
    {label} ({count})
  </button>
)