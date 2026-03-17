import { useRef, useState, useEffect, useCallback } from "react"

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
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setLocalValue(value); }, [value])

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
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, []);

    return (
        <div style={{ background: "#0f766e", padding: "20px 24px 24px" }}>
            <div
                onClick={() => inputRef.current?.focus()}
                style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "white", borderRadius: 10, padding: "0 16px", height: 48,
                    // border instead of box-shadow
                    border: focused ? "2px solid #5eead4" : "2px solid transparent",
                    boxShadow: focused
                        ? "inset 0 0 0 1px rgba(15,118,110,0.25)"
                        : "0 1px 3px rgba(0,0,0,0.12)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    cursor: "text",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
                    style={{ flexShrink: 0, color: focused ? "#0f766e" : "#9ca3af", transition: "color 0.15s" }}>
                    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                    ref={inputRef} value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder={placeholder} autoFocus={autoFocus}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#111827", background: "transparent", fontFamily: "inherit" }}
                />
                {localValue && (
                    <button onMouseDown={handleClear}
                        style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#6b7280", fontSize: 13, lineHeight: 1 }}>
                        x
                    </button>
                )}
            </div>
            {subtitle && <p style={{ color: "#a7f3d0", fontSize: 12, margin: "8px 0 0 4px" }}>{subtitle}</p>}
        </div>
    )
}