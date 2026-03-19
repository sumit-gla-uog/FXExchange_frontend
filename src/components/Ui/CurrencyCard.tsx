import { useState } from "react"
import { StackLayout, Text } from "@salt-ds/core"
import { CurrencyFlag } from "../../components/ui/CurrencyFlag"
import "./CurrencyCard.css"

export interface CurrencyCardData {
  code: string
  name?: string
  rate: number | null
  changePct: number | null
  isBase?: boolean
}

interface CurrencyCardProps {
  data: CurrencyCardData
  variant?: "full" | "compact"
  onClick?: () => void
}

export const CurrencyCard = ({ data, variant = "full", onClick }: CurrencyCardProps) => {
  const [hovered, setHovered] = useState(false)
  const { code, name, rate, changePct, isBase } = data
  const isPositive = changePct !== null && changePct >= 0
  const changeClass = `change ${isPositive ? "positive" : "negative"}`

  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          "currency-card-compact",
          onClick ? "clickable" : "",
          hovered ? "hovered" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="flag"><CurrencyFlag code={code} size={1.5} /></div>
        <Text className="code">{code}</Text>
        <Text className="rate">{rate !== null ? rate.toFixed(4) : "—"}</Text>
        {changePct !== null && (
          <Text className={changeClass}>
            {isPositive ? "↗ +" : "↘ "}{changePct.toFixed(2)}%
          </Text>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "currency-card-full",
        onClick ? "clickable" : "",
        hovered ? "hovered" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="flag"><CurrencyFlag code={code} size={2} /></div>
      <Text className="code">{code}</Text>
      {name && <Text className="name">{name}</Text>}
      <div className="divider" />
      {isBase ? (
        <Text className="base-label">Base Currency</Text>
      ) : rate !== null ? (
        <StackLayout gap={0} style={{ alignItems: "center" }}>
          <Text className="rate-label">
            Rate: <span className="rate-value">{rate.toFixed(4)}</span>
          </Text>
          {changePct !== null && (
            <Text className={changeClass}>
              {isPositive ? "↗ +" : "↘ "}{changePct.toFixed(2)}%
            </Text>
          )}
        </StackLayout>
      ) : (
        <Text className="no-rate">No rate available</Text>
      )}
    </div>
  )
}