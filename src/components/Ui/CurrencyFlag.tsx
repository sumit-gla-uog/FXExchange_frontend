import { AD, AE, AU, CA, CH, CN, EU, GB, HK, IN, JP, SG, US } from "@salt-ds/countries"
import type { ComponentType } from "react"

const FLAG_COMPONENTS: Record<string, ComponentType<{ size?: number }>> = {
  GBP: GB,
  USD: US,
  EUR: EU,
  JPY: JP,
  CNY: CN,
  HKD: HK,
  AUD: AU,
  CAD: CA,
  CHF: CH,
  SGD: SG,
  AED: AE,
  INR: IN,
}

interface CurrencyFlagProps {
  code: string
  size?: number
}

export const CurrencyFlag = ({ code, size = 1.5 }: CurrencyFlagProps) => {
  const FlagComponent = FLAG_COMPONENTS[code]
  if (!FlagComponent) return <span style={{ fontSize: size * 16 }}></span>
  return <FlagComponent size={size} />
}