import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import useSWR from "swr"
import { Card, StackLayout, FlexLayout, Text, Button, Input, FormField, FormFieldLabel, FormFieldHelperText, Spinner } from "@salt-ds/core"
import { useDeposit } from "../../hooks/customer/useDeposit"
import { fetcher } from "../../api/swr"
import type { DepositPayload } from "../../hooks/customer/useDeposit"
import "./DepositPage.css"
import { SuccessTickIcon } from '@salt-ds/icons';

const PRESET_AMOUNTS = ["500", "1000", "2500", "5000"]

export const DepositPage = () => {
  const [success, setSuccess] = useState<{ amount: string; balance: string } | null>(null)

  const { deposit, isLoading, error: serverError } = useDeposit()
  const { data: meData } = useSWR<{ user: { username: string } }>("/api/v1/auth/me/", fetcher)
  const username = meData?.user?.username ?? ""

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DepositPayload>({
    defaultValues: { amount: "", bank_name: "", account_number: "", sort_code: "" },
  })

  const amount = watch("amount")

  const onSubmit = async (data: DepositPayload) => {
    try {
      const res = await deposit(data)
      setSuccess({ amount: res.deposit.amount, balance: res.deposit.new_balance })
      reset()
    } catch {
      // serverError comes from hook
    }
  }

  return (
    <StackLayout gap={3}>
      <Card className="deposit-card">

        {/* Welcome header */}
        <div className="deposit-welcome">
          <Text className="deposit-welcome-text">
            Welcome, <span className="deposit-welcome-name">{username}</span>
          </Text>
          <Text styleAs="label" className="deposit-subtitle">
            Add GBP to your account to start trading
          </Text>
        </div>

        {success ? (
          <StackLayout gap={2} className="deposit-success">
            <div className="deposit-success-icon"><SuccessTickIcon/></div>
            <Text className="deposit-success-title">Deposit Successful!</Text>
            <Text className="deposit-success-sub">
              £{parseFloat(success.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })} has been added to your account.
            </Text>
            <Text className="deposit-success-balance">
              New GBP Balance: £{parseFloat(success.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </Text>
            <Button appearance="solid" sentiment="accented" onClick={() => setSuccess(null)}>
              Make Another Deposit
            </Button>
          </StackLayout>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <StackLayout gap={2.5}>

              {/* Preset amounts */}
              <StackLayout gap={1}>
                <Text styleAs="label" className="deposit-field-label">Quick Select Amount</Text>
                <FlexLayout gap={1} wrap>
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      appearance={amount === preset ? "solid" : "bordered"}
                      sentiment={amount === preset ? "accented" : "neutral"}
                      className={`deposit-preset-btn ${amount === preset ? "active" : ""}`}
                      onClick={() => setValue("amount", preset)}
                    >
                      £{parseInt(preset).toLocaleString("en-GB")}
                    </Button>
                  ))}
                </FlexLayout>
              </StackLayout>

              {/* Bank details section */}
              <div className="deposit-bank-section">
                <Text className="deposit-bank-title">Bank Details</Text>
                <StackLayout gap={2}>

                  {/* Account number + Sort code */}
                  <FlexLayout  >
                    <FormField style={{ flex: "1 1 120px" }} validationStatus={errors.account_number ? "error" : undefined}>
                      <FormFieldLabel>Account Number</FormFieldLabel>
                      <Controller name="account_number" control={control}
                        rules={{
                          required: "Account number is required",
                          pattern: { value: /^\d{8}$/, message: "Must be 8 digits" }
                        }}
                        render={({ field }) => <Input {...field} placeholder="12345678" maxLength={8} />}
                      />
                      {errors.account_number && <FormFieldHelperText>{errors.account_number.message}</FormFieldHelperText>}
                    </FormField>

                    <FormField style={{ flex: "1 1 120px" }} validationStatus={errors.sort_code ? "error" : undefined}>
                      <FormFieldLabel>Sort Code</FormFieldLabel>
                      <Controller name="sort_code" control={control}
                        rules={{
                          required: "Sort code is required",
                          pattern: { value: /^\d{2}-\d{2}-\d{2}$/, message: "Format: XX-XX-XX" }
                        }}
                        render={({ field }) => <Input {...field} placeholder="12-34-56" maxLength={8} />}
                      />
                      {errors.sort_code && <FormFieldHelperText>{errors.sort_code.message}</FormFieldHelperText>}
                    </FormField>
                  </FlexLayout>

                  {/* Amount details */}
                  <FlexLayout  >
                  <FormField validationStatus={errors.amount ? "error" : undefined}>
                    <FormFieldLabel>Amount (GBP)</FormFieldLabel>
                    <Controller name="amount" control={control}
                      rules={{
                        required: "Amount is required",
                        validate: (v) => {
                          const n = parseFloat(v)
                          if (isNaN(n) || n <= 0) return "Must be a positive number"
                          if (n > 100000) return "Maximum deposit is £100,000"
                          return true
                        }
                      }}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="e.g. 1000" startAdornment={<span className="deposit-currency-symbol">£</span>} />
                      )}
                    />
                    {errors.amount && <FormFieldHelperText>{errors.amount.message}</FormFieldHelperText>}
                  </FormField>

                  <FormField validationStatus={errors.bank_name ? "error" : undefined}>
                    <FormFieldLabel>Bank Name</FormFieldLabel>
                    <Controller name="bank_name" control={control}
                      rules={{ required: "Bank name is required" }}
                      render={({ field }) => <Input {...field} placeholder="e.g. HSBC, Barclays, Lloyds" />}
                    />
                    {errors.bank_name && <FormFieldHelperText>{errors.bank_name.message}</FormFieldHelperText>}
                  </FormField>
                  </FlexLayout>

                </StackLayout>
              </div>

              {/* Info box */}
              <div className="deposit-info-box">
                <Text style={{ fontSize: 12, color: "#1d4ed8" }}>
                  <strong>Simulated Deposit:</strong> This is a reference platform. No real bank transfer will occur. Funds are added instantly for demonstration purposes.
                </Text>
              </div>

              {serverError && <Text className="deposit-error">{serverError}</Text>}

              {/* Deposit button */}
              <button type="submit" className="deposit-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <FlexLayout align="center" justify="center" gap={1}>
                    <Spinner size="small" />
                    <span>Processing...</span>
                  </FlexLayout>
                ) : (
                  `Deposit £${parseFloat(amount || "0").toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
                )}
              </button>

            </StackLayout>
          </form>
        )}
      </Card>
    </StackLayout>
  )
}