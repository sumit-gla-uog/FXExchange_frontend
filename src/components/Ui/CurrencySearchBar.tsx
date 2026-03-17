import { useRef, useState, useEffect, useCallback } from "react"
import "./CurrencySearchBar.css"

interface CurrencySearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  subtitle?: string
  autoFocus?: boolean
}

export const CurrencySearchBar = ({
  value, onChange, placeholder = "Search...", subtitle, autoFocus = false,
}: CurrencySearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)
  const [focused, setFocused] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setLocalValue(value) }, [value])

  const handleChange = useCallback((raw: string) => {
    setLocalValue(raw)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => onChange(raw), 350)
  }, [onChange])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setLocalValue("")
    onChange("")
    inputRef.current?.focus()
  }

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [])

  return (
    <div className="search-bar-wrapper">
      <div
        className={`search-bar-input-row ${focused ? "focused" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        <svg
          width="18" height="18" viewBox="0 0 20 20" fill="none"
          className={`search-bar-icon ${focused ? "focused" : ""}`}
        >
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-bar-input"
        />
        {localValue && (
          <button onMouseDown={handleClear} className="search-bar-clear">
            x
          </button>
        )}
      </div>
      {subtitle && <p className="search-bar-subtitle">{subtitle}</p>}
    </div>
  )
}