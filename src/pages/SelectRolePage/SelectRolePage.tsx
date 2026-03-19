import { useState } from "react"
import { Card, StackLayout, H2, H3, Text } from "@salt-ds/core"
import { CurrencyExchangeIcon } from "@salt-ds/icons"
import { useSelectRole } from "../../hooks/useSelectRole"
import "./SelectRolePage.css"

export const SelectRolePage = () => {
  const [selected, setSelected] = useState<"customer" | "admin">("customer")
  const { username, isAdmin, isLoading, pick } = useSelectRole()

  const handleContinue = () => pick(selected)

  if (isLoading) return (
    <div className="select-role-page">
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="select-role-page">
      <StackLayout gap={1} align="center">

        {/* Logo */}
        <div className="select-role-logo">
          <CurrencyExchangeIcon size={3} className="select-role-logo-icon" />
        </div>

        <H2 className="select-role-title">FX Exchange</H2>
        <Text variant="secondary" className="select-role-subtitle">
          Multi-Currency Exchange Dashboard
        </Text>

        <Card className="select-role-card">
          <StackLayout gap={2.5}>

            <StackLayout gap={0} align="center">
              <Text className="select-role-welcome-text">Welcome back,</Text>
              <H3 className="select-role-username">{username}</H3>
            </StackLayout>

            <StackLayout gap={0.5}>
              <Text className="select-role-label">Select Role</Text>

              <div
                className={`select-role-option ${selected === "customer" ? "active" : ""}`}
                onClick={() => setSelected("customer")}
              >
                <div className={`select-role-radio ${selected === "customer" ? "checked" : ""}`}>
                  {selected === "customer" && <div className="select-role-radio-dot" />}
                </div>
                <StackLayout gap={0}>
                  <Text className="select-role-option-title">Customer</Text>
                  <Text className="select-role-option-sub">View balances and exchange currencies</Text>
                </StackLayout>
              </div>

              {/* Admin option, only if user is admin */}
              {isAdmin && (
                <div
                  className={`select-role-option ${selected === "admin" ? "active" : ""}`}
                  onClick={() => setSelected("admin")}
                >
                  <div className={`select-role-radio ${selected === "admin" ? "checked" : ""}`}>
                    {selected === "admin" && <div className="select-role-radio-dot" />}
                  </div>
                  <StackLayout gap={0}>
                    <Text className="select-role-option-title">Administrator</Text>
                    <Text className="select-role-option-sub">Manage currencies and rates</Text>
                  </StackLayout>
                </div>
              )}
            </StackLayout>

            {/* Continue button */}
            <button className="select-role-btn" onClick={handleContinue}>
              Continue as {selected === "customer" ? "Customer" : "Administrator"}
            </button>

            <div className="select-role-disclaimer">
              <Text variant="secondary">
                <strong>Disclaimer:</strong> This is a simulated trading platform for reference only. Not financial advice. Bank fees may apply for real transactions.
              </Text>
            </div>

          </StackLayout>
        </Card>
      </StackLayout>
    </div>
  )
}