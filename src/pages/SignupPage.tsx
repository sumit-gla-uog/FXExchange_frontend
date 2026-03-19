import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { Card, StackLayout, Button, Text, H2, H3, FormField, FormFieldLabel, FormFieldHelperText, Input, Link } from "@salt-ds/core"
import { useSignup } from "../hooks/useSignup"
import styles from "./Loginpage/LoginPage.module.css"
import "./SignupPage.css"

type SignupForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: "customer" | "admin"
}

export const SignupPage = () => {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [success, setSuccess] = useState(false)

  const { signup, isLoading, error: serverError } = useSignup()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", role: "customer" },
  })

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      setSuccess(true)
      setTimeout(() => navigate("/login"), 1500)
    } catch {
      // serverError comes from hook
    }
  }

  return (
    <div className={styles.authPage}>
      <StackLayout gap={1} align="center">
        <H2>FX Exchange</H2>
        <Text variant="secondary">Multi-Currency Exchange Dashboard</Text>

        <Card className={styles.authCard}>
          <StackLayout gap={2}>
            <H3 style={{ textAlign: "center" }}>Create Account</H3>

            {success ? (
              <StackLayout gap={1} align="center" style={{ padding: "20px 0" }}>
                <Text style={{ color: "#059669", fontWeight: 600, fontSize: 16 }}>
                  Account created successfully!
                </Text>
                <Text variant="secondary">Redirecting to login...</Text>
              </StackLayout>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <StackLayout gap={2}>

                  <FormField validationStatus={errors.username ? "error" : undefined}>
                    <FormFieldLabel>Username</FormFieldLabel>
                    <Controller name="username" control={control}
                      rules={{
                        required: "Username is required",
                        minLength: { value: 3, message: "Minimum 3 characters" },
                      }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Enter username" />
                      )}
                    />
                    {errors.username && <FormFieldHelperText>{errors.username.message}</FormFieldHelperText>}
                  </FormField>

                  <FormField validationStatus={errors.email ? "error" : undefined}>
                    <FormFieldLabel>Email</FormFieldLabel>
                    <Controller name="email" control={control}
                      rules={{
                        required: "Email is required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                      }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Enter email" type="email" />
                      )}
                    />
                    {errors.email && <FormFieldHelperText>{errors.email.message}</FormFieldHelperText>}
                  </FormField>

                  <FormField validationStatus={errors.password ? "error" : undefined}>
                    <FormFieldLabel>Password</FormFieldLabel>
                    <Controller name="password" control={control}
                      rules={{
                        required: "Password is required",
                        minLength: { value: 6, message: "Minimum 6 characters" },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          inputProps={{ type: showPwd ? "text" : "password" }}
                          placeholder="Enter password"
                          endAdornment={
                            <Button type="button" appearance="transparent" onClick={() => setShowPwd(v => !v)}>
                              {showPwd ? "Hide" : "Show"}
                            </Button>
                          }
                        />
                      )}
                    />
                    {errors.password && <FormFieldHelperText>{errors.password.message}</FormFieldHelperText>}
                  </FormField>

                  <FormField validationStatus={errors.confirmPassword ? "error" : undefined}>
                    <FormFieldLabel>Confirm Password</FormFieldLabel>
                    <Controller name="confirmPassword" control={control}
                      rules={{
                        required: "Please confirm your password",
                        validate: (val) => val === watch("password") || "Passwords do not match",
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          inputProps={{ type: showPwd ? "text" : "password" }}
                          placeholder="Confirm password"
                        />
                      )}
                    />
                    {errors.confirmPassword && <FormFieldHelperText>{errors.confirmPassword.message}</FormFieldHelperText>}
                  </FormField>

                  <FormField>
                    <FormFieldLabel>Account Type</FormFieldLabel>
                    <Controller name="role" control={control}
                      render={({ field }) => (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => field.onChange("customer")}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                              border: `1px solid ${field.value === "customer" ? "#0f766e" : "#e5e7eb"}`,
                              background: field.value === "customer" ? "#0f766e" : "#f9fafb",
                              color: field.value === "customer" ? "white" : "#374151",
                              fontWeight: field.value === "customer" ? 600 : 500,
                              fontSize: 14,
                            }}
                          >
                            Customer
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("admin")}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                              border: `1px solid ${field.value === "admin" ? "#0f766e" : "#e5e7eb"}`,
                              background: field.value === "admin" ? "#0f766e" : "#f9fafb",
                              color: field.value === "admin" ? "white" : "#374151",
                              fontWeight: field.value === "admin" ? 600 : 500,
                              fontSize: 14,
                            }}
                          >
                            Admin
                          </button>
                        </div>
                      )}
                    />
                  </FormField>

                  {serverError && (
                    <Text style={{ color: "#dc2626", fontSize: 13 }}>{serverError}</Text>
                  )}

                  <button type="submit" className="signup-submit-btn" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </button>

                  <Text variant="secondary" style={{ textAlign: "center" }}>
                    Already have an account?{" "}
                    <Link onClick={() => navigate("/login")}>Login</Link>
                  </Text>

                  <div className={styles.disclaimerBox}>
                    <Text variant="secondary">
                      Disclaimer: This is a simulated trading platform for reference only. Not financial advice.
                    </Text>
                  </div>

                </StackLayout>
              </form>
            )}
          </StackLayout>
        </Card>
      </StackLayout>
    </div>
  )
}