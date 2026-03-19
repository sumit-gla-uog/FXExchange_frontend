import { Card, StackLayout, Text } from "@salt-ds/core"
import "./StatCard.css"

interface StatCardProps {
  label: string
  value?: string | number
  sub?: string
  subColor?: string
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

export const StatCard = ({
  label,
  value,
  sub,
  subColor,
  onClick,
  children,
  className,
}: StatCardProps) => (
  <Card
    onClick={onClick}
    className={["stat-card", onClick ? "clickable" : "", className ?? ""].filter(Boolean).join(" ")}
  >
    <StackLayout gap={0.5}>
      <Text styleAs="label" className="label">{label}</Text>
      {children ?? (
        <>
          <Text className="value">{value}</Text>
          {sub && (
            <Text styleAs="label" className="sub" style={{ color: subColor ?? "#6b7280" }}>
              {sub}
            </Text>
          )}
        </>
      )}
    </StackLayout>
  </Card>
)