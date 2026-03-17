import { Card, StackLayout, FlexLayout, Text } from "@salt-ds/core"
import { ArrowRightIcon } from "@salt-ds/icons"
import "./ActionCard.css"

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  linkText: string
  onClick: () => void
}

export const ActionCard = ({ icon, title, description, linkText, onClick }: ActionCardProps) => (
  <Card className="action-card">
    <StackLayout gap={2}>
      <FlexLayout align="center" gap={2}>
        <div className="icon">{icon}</div>
        <StackLayout gap={0}>
          <Text className="title">{title}</Text>
          <Text styleAs="label" className="subtitle">{description}</Text>
        </StackLayout>
      </FlexLayout>
      <button className="link" onClick={onClick}>
        {linkText} <ArrowRightIcon />
      </button>
    </StackLayout>
  </Card>
)