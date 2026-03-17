import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, StackLayout, FlexLayout, Button, Text, H2, H3, FormField, FormFieldLabel, FormFieldHelperText, Input, Divider } from "@salt-ds/core"
import { logout } from "../../../api/auth"
import "./CustomerLandingPage.css"

type QuickConvertForm = {
  amount: string
  from: string
  to: string
}

export const CustomerLandingPage = () => {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuickConvertForm>({
    defaultValues: { amount: "1000", from: "GBP", to: "USD" },
  })

  const portfolio = useMemo(() => ({
    base: "GBP", totalValue: 24477.8, cashBalance: 10000, openOrders: 0, apiStatus: "Online",
  }), [])

  const market = useMemo(() => [
    { code: "USD", rate: 1.3847, changePct: -2.17 },
    { code: "EUR", rate: 1.1218, changePct: -0.79 },
    { code: "JPY", rate: 2.2359, changePct: -0.13 },
    { code: "CNY", rate: 2.0621, changePct: +0.10 },
    { code: "HKD", rate: 1.1236, changePct: -2.0 },
    { code: "AUD", rate: 2.0755, changePct: -1.05 },
  ], [])

  const onQuickConvert = async (data: QuickConvertForm) => {
    console.log("Quick convert:", data)
    navigate("/trade")
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="landing-page">
      <div className="landing-topbar">
        <FlexLayout justify="space-between" align="center" wrap>
          <div>
            <H2 className="title">Dashboard</H2>
            <Text styleAs="secondary" className="subtitle">Welcome back</Text>
          </div>
          <FlexLayout gap={1} align="center">
            <div>
              <Text styleAs="secondary" className="base-label">Base Currency</Text>
              <Text className="base-value">{portfolio.base}</Text>
            </div>
            <Button appearance="solid" sentiment="accented" onClick={() => navigate("/trade")}>New Trade</Button>
            <Button appearance="outlined" onClick={handleLogout}>Logout</Button>
          </FlexLayout>
        </FlexLayout>
      </div>

      <div className="landing-content">
        <StackLayout gap={2}>
          <FlexLayout gap={2} wrap>
            <Card className="landing-summary-card">
              <Text styleAs="secondary">Portfolio Value</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.totalValue.toFixed(2)}</H3>
              <Text styleAs="secondary">{portfolio.base}</Text>
            </Card>
            <Card className="landing-summary-card">
              <Text styleAs="secondary">{portfolio.base} Balance</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.cashBalance.toFixed(2)}</H3>
              <Text styleAs="secondary">{portfolio.base}</Text>
            </Card>
            <Card className="landing-summary-card">
              <Text styleAs="secondary">Open Orders</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.openOrders}</H3>
              <Text styleAs="secondary">Active</Text>
            </Card>
            <Card className="landing-summary-card">
              <Text styleAs="secondary">API Status</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.apiStatus}</H3>
              <Text styleAs="secondary">All systems operational</Text>
            </Card>
          </FlexLayout>

          <Card className="landing-market-card">
            <FlexLayout justify="space-between" align="center" wrap>
              <div>
                <H3 style={{ margin: 0 }}>Market Snapshot</H3>
                <Text styleAs="secondary">Top currencies vs {portfolio.base}</Text>
              </div>
              <Button appearance="transparent" onClick={() => navigate("/markets")}>View All</Button>
            </FlexLayout>

            <Divider style={{ margin: "12px 0" }} />

            <FlexLayout gap={1} wrap>
              {market.map((m) => {
                const up = m.changePct >= 0
                return (
                  <Card key={m.code} className="landing-market-item">
                    <FlexLayout justify="space-between" align="center">
                      <Text className="code">{m.code}</Text>
                      <Text className={`change ${up ? "up" : "down"}`}>
                        {up ? "+" : ""}{m.changePct.toFixed(2)}%
                      </Text>
                    </FlexLayout>
                    <Text styleAs="secondary" className="rate">{m.rate.toFixed(4)}</Text>
                  </Card>
                )
              })}
            </FlexLayout>
          </Card>

          <Card className="landing-convert-card">
            <H3 className="landing-convert-title">Quick Convert</H3>
            <Text styleAs="secondary">Get a quick quote (wire API later)</Text>

            <form onSubmit={handleSubmit(onQuickConvert)} className="landing-convert-form">
              <FlexLayout gap={2} wrap align="end">
                <FormField className="landing-convert-field-amount" validationStatus={errors.amount ? "error" : undefined}>
                  <FormFieldLabel>Amount</FormFieldLabel>
                  <Input {...register("amount", { required: "Amount required", validate: (v) => (Number(v) > 0 ? true : "Must be > 0") })} inputMode="decimal" placeholder="e.g. 1000" />
                  {errors.amount && <FormFieldHelperText>{errors.amount.message}</FormFieldHelperText>}
                </FormField>

                <FormField className="landing-convert-field-from" validationStatus={errors.from ? "error" : undefined}>
                  <FormFieldLabel>From</FormFieldLabel>
                  <Input {...register("from", { required: "From required" })} placeholder="GBP" />
                  {errors.from && <FormFieldHelperText>{errors.from.message}</FormFieldHelperText>}
                </FormField>

                <FormField className="landing-convert-field-to" validationStatus={errors.to ? "error" : undefined}>
                  <FormFieldLabel>To</FormFieldLabel>
                  <Input {...register("to", { required: "To required" })} placeholder="USD" />
                  {errors.to && <FormFieldHelperText>{errors.to.message}</FormFieldHelperText>}
                </FormField>

                <Button type="submit" appearance="solid" sentiment="accented" disabled={isSubmitting}>
                  {isSubmitting ? "Working..." : "Get Quote"}
                </Button>
              </FlexLayout>
            </form>
          </Card>
        </StackLayout>
      </div>
    </div>
  )
}