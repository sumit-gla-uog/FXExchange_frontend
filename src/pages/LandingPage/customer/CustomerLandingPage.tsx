import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  StackLayout,
  FlexLayout,
  Button,
  Text,
  H2,
  H3,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  Divider,
} from "@salt-ds/core";
import { logout } from "../../../api/auth";

type QuickConvertForm = {
  amount: string;     // keep string in form, parse later
  from: string;
  to: string;
};

export const CustomerLandingPage = () =>{
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuickConvertForm>({
    defaultValues: { amount: "1000", from: "GBP", to: "USD" },
  });

  const portfolio = useMemo(
    () => ({
      base: "GBP",
      totalValue: 24477.8,
      cashBalance: 10000,
      openOrders: 0,
      apiStatus: "Online",
    }),
    []
  );

  const market = useMemo(
    () => [
      { code: "USD", rate: 1.3847, changePct: -2.17 },
      { code: "EUR", rate: 1.1218, changePct: -0.79 },
      { code: "JPY", rate: 2.2359, changePct: -0.13 },
      { code: "CNY", rate: 2.0621, changePct: +0.10 },
      { code: "HKD", rate: 1.1236, changePct: -2.0 },
      { code: "AUD", rate: 2.0755, changePct: -1.05 },
    ],
    []
  );

  const onQuickConvert = async (data: QuickConvertForm) => {
    // later: call API / quote endpoint
    console.log("Quick convert:", data);
    navigate("/trade"); // or keep on same page for now
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }}>
      {/* Top bar */}
      <div style={{ background: "#0f766e", padding: "16px 20px" }}>
        <FlexLayout justify="space-between" align="center" wrap>
          <div>
            <H2 style={{ color: "white", margin: 0 }}>Dashboard</H2>
            <Text styleAs="secondary" style={{ color: "#d1fae5" }}>
              Welcome back
            </Text>
          </div>

          <FlexLayout gap={1} align="center">
            <div style={{ textAlign: "right" }}>
              <Text styleAs="secondary" style={{ color: "#d1fae5" }}>
                Base Currency
              </Text>
              <Text style={{ color: "white" }}>{portfolio.base}</Text>
            </div>

            <Button appearance="solid" sentiment="accented" onClick={() => navigate("/trade")}>
              New Trade
            </Button>

            <Button appearance="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </FlexLayout>
        </FlexLayout>
      </div>

      <div style={{ padding: 20 }}>
        <StackLayout gap={2}>
          {/* Summary row (responsive: wraps automatically) */}
          <FlexLayout gap={2} wrap>
            <Card style={{ flex: "1 1 240px", padding: 16 }}>
              <Text styleAs="secondary">Portfolio Value</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.totalValue.toFixed(2)}</H3>
              <Text styleAs="secondary">{portfolio.base}</Text>
            </Card>

            <Card style={{ flex: "1 1 240px", padding: 16 }}>
              <Text styleAs="secondary">{portfolio.base} Balance</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.cashBalance.toFixed(2)}</H3>
              <Text styleAs="secondary">{portfolio.base}</Text>
            </Card>

            <Card style={{ flex: "1 1 240px", padding: 16 }}>
              <Text styleAs="secondary">Open Orders</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.openOrders}</H3>
              <Text styleAs="secondary">Active</Text>
            </Card>

            <Card style={{ flex: "1 1 240px", padding: 16 }}>
              <Text styleAs="secondary">API Status</Text>
              <H3 style={{ margin: "8px 0" }}>{portfolio.apiStatus}</H3>
              <Text styleAs="secondary">All systems operational</Text>
            </Card>
          </FlexLayout>

          {/* Market Snapshot */}
          <Card style={{ padding: 16 }}>
            <FlexLayout justify="space-between" align="center" wrap>
              <div>
                <H3 style={{ margin: 0 }}>Market Snapshot</H3>
                <Text styleAs="secondary">Top currencies vs {portfolio.base}</Text>
              </div>
              <Button appearance="transparent" onClick={() => navigate("/markets")}>
                View All
              </Button>
            </FlexLayout>

            <Divider style={{ margin: "12px 0" }} />

            <FlexLayout gap={1} wrap>
              {market.map((m) => {
                const up = m.changePct >= 0;
                return (
                  <Card
                    key={m.code}
                    style={{
                      padding: 12,
                      flex: "1 1 160px",
                      background: "#fafafa",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    <FlexLayout justify="space-between" align="center">
                      <Text style={{ fontWeight: 700 }}>{m.code}</Text>
                      <Text style={{ color: up ? "#16a34a" : "#dc2626" }}>
                        {up ? "+" : ""}
                        {m.changePct.toFixed(2)}%
                      </Text>
                    </FlexLayout>
                    <Text styleAs="secondary" style={{ marginTop: 6 }}>
                      {m.rate.toFixed(4)}
                    </Text>
                  </Card>
                );
              })}
            </FlexLayout>
          </Card>

         
          <Card style={{ padding: 16 }}>
            <H3 style={{ marginTop: 0 }}>Quick Convert</H3>
            <Text styleAs="secondary">Get a quick quote (wire API later)</Text>

            <form onSubmit={handleSubmit(onQuickConvert)} style={{ marginTop: 12 }}>
              <FlexLayout gap={2} wrap align="end">
                <FormField style={{ flex: "1 1 180px" }} validationStatus={errors.amount ? "error" : undefined}>
                  <FormFieldLabel>Amount</FormFieldLabel>
                  <Input
                    {...register("amount", {
                      required: "Amount required",
                      validate: (v) => (Number(v) > 0 ? true : "Must be > 0"),
                    })}
                    inputMode="decimal"
                    placeholder="e.g. 1000"
                  />
                  {errors.amount && (
                    <FormFieldHelperText>{errors.amount.message}</FormFieldHelperText>
                  )}
                </FormField>

                <FormField style={{ flex: "1 1 140px" }} validationStatus={errors.from ? "error" : undefined}>
                  <FormFieldLabel>From</FormFieldLabel>
                  <Input {...register("from", { required: "From required" })} placeholder="GBP" />
                  {errors.from && <FormFieldHelperText>{errors.from.message}</FormFieldHelperText>}
                </FormField>

                <FormField style={{ flex: "1 1 140px" }} validationStatus={errors.to ? "error" : undefined}>
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
  );
}
