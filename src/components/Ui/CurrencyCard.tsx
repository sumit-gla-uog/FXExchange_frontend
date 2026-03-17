import { useState } from "react"
import { StackLayout, Text } from "@salt-ds/core"

export interface CurrencyCardData {
    code: string
    name?: string
    flag: string
    rate: number | null
    changePct: number | null
    isBase?: boolean
}

interface CurrencyCardProps {
    data: CurrencyCardData
    variant?: "full" | "compact"
    onClick?: () => void
}

export const CurrencyCard = ({
    data,
    variant = "full",
    onClick,
}: CurrencyCardProps) => {
    const [hovered, setHovered] = useState(false)
    const { code, name, flag, rate, changePct, isBase } = data
    const isPositive = changePct !== null && changePct >= 0

    // Compact variant — Dashboard market snapshot row
    if (variant === "compact") {
        return (
            <div
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    minWidth: 130,
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1.5px solid ${hovered ? "#0f766e" : "#e5e7eb"}`,
                    background: hovered ? "#f0fdfa" : "#f8fafc",
                    textAlign: "center",
                    flex: "0 0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    cursor: onClick ? "pointer" : "default",
                    transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
                    boxShadow: hovered ? "0 0 0 3px rgba(15,118,110,0.10)" : "none",
                }}
            >
                <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 2 }}>{flag}</div>
                <Text style={{ fontWeight: 700, fontSize: 14, color: "#111827", letterSpacing: "0.01em" }}>
                    {code}
                </Text>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    {rate !== null ? rate.toFixed(4) : "—"}
                </Text>
                {changePct !== null && (
                    <Text style={{ fontSize: 12, fontWeight: 600, color: isPositive ? "#059669" : "#dc2626" }}>
                        {isPositive ? "↗ +" : "↘ "}{changePct.toFixed(2)}%
                    </Text>
                )}
            </div>
        )
    }

    // Full variant Currencies page grid
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: "28px 20px 24px",
                borderRadius: 14,
                border: `1.5px solid ${hovered ? "#0f766e" : "#e5e7eb"}`,
                background: "white",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                cursor: onClick ? "pointer" : "default",
                transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                boxShadow: hovered
                    ? "0 0 0 3px rgba(15,118,110,0.10), 0 4px 16px rgba(0,0,0,0.07)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
            }}
        >
            <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 14 }}>{flag}</div>

            <Text style={{ fontWeight: 700, fontSize: 18, color: "#111827", letterSpacing: "-0.01em" }}>
                {code}
            </Text>

            {name && (
                <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>
                    {name}
                </Text>
            )}

            <div style={{ width: "100%", height: 1, background: "#f3f4f6", margin: "14px 0 12px" }} />

            {isBase ? (
                <Text style={{ color: "#0f766e", fontWeight: 600, fontSize: 13 }}>
                    Base Currency
                </Text>
            ) : rate !== null ? (
                <StackLayout gap={0} style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 13, color: "#6b7280" }}>
                        Rate:{" "}
                        <span style={{ color: "#111827", fontWeight: 600 }}>
                            {rate.toFixed(4)}
                        </span>
                    </Text>
                    {changePct !== null && (
                        <Text style={{ fontSize: 13, fontWeight: 600, color: isPositive ? "#059669" : "#dc2626", marginTop: 4 }}>
                            {isPositive ? "↗ +" : "↘ "}{changePct.toFixed(2)}%
                        </Text>
                    )}
                </StackLayout>
            ) : (
                <Text style={{ fontSize: 12, color: "#d1d5db" }}>No rate available</Text>
            )}
        </div>
    )
}