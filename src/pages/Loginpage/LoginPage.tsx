import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styles from "./LoginPage.module.css"
import { Card, StackLayout, FormField, FormFieldLabel, FormFieldHelperText, Input, Button, Link, H2, H3, Text } from "@salt-ds/core"
import { CurrencyExchangeIcon } from "@salt-ds/icons"
import { login } from "../../api/auth"

type LoginForm = {
  username: string
  password: string
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const disclaimer = "Disclaimer: This is a simulated trading platform for reference only. Not financial advice. Bank fees may apply for real transactions."

  const { control, handleSubmit, setError, formState: { isSubmitting, errors } } = useForm<LoginForm>({
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password)
      navigate("/select-role", { replace: true })
    } catch (e: any) {
      setError("password", { message: e?.message ?? "Login failed" })
    }
  }

  return (
    <div className={styles.authPage}>
      <StackLayout gap={1} align="center">

        {/* Logo icon */}
        <div className={styles.authLogoWrap}>
          <CurrencyExchangeIcon size={3} className={styles.authLogoIcon} />
        </div>

        <H2 className={styles.authTitle}>FX Exchange</H2>
        <Text variant="secondary" className={styles.authSubtitle}>Multi-Currency Exchange Dashboard</Text>

        <Card className={styles.authCard}>
          <StackLayout gap={2}>
            <H3 style={{ textAlign: "center" }}>Welcome Back</H3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <StackLayout gap={2}>
                <FormField validationStatus={errors.username ? "error" : undefined}>
                  <FormFieldLabel>Username</FormFieldLabel>
                  <Controller name="username" control={control}
                    rules={{ required: "Username required" }}
                    render={({ field }) => <Input {...field} placeholder="Enter your username" />}
                  />
                  {errors.username && <FormFieldHelperText>{errors.username.message}</FormFieldHelperText>}
                </FormField>

                <FormField validationStatus={errors.password ? "error" : undefined}>
                  <FormFieldLabel>Password</FormFieldLabel>
                  <div className={styles.pwdWrap}>
                    <Controller name="password" control={control}
                      rules={{ required: "Password required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          inputProps={{ type: showPwd ? "text" : "password" }}
                          placeholder="Enter your password"
                          endAdornment={
                            <Button type="button" appearance="transparent" onClick={() => setShowPwd(v => !v)}>
                              {showPwd ? "Hide" : "Show"}
                            </Button>
                          }
                        />
                      )}
                    />
                  </div>
                  {errors.password && <FormFieldHelperText>{errors.password.message}</FormFieldHelperText>}
                </FormField>

                <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <Text variant="secondary" className={styles.signupRow}>
                  Don't have an account?{" "}
                  <Link onClick={() => navigate("/signup")}>Sign up</Link>
                </Text>

                <div className={styles.disclaimerBox}>
                  <Text variant="secondary">{disclaimer}</Text>
                </div>
              </StackLayout>
            </form>
          </StackLayout>
        </Card>
      </StackLayout>
    </div>
  )
}