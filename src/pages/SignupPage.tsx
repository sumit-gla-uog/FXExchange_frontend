import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { Card, StackLayout, Button, Text, H2, H3, FormField, FormFieldLabel, FormFieldHelperText, Input, Link } from "@salt-ds/core"
import { useSignup } from "../hooks/useSignup"
import styles from "./Loginpage/LoginPage.module.css"

type SignupForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
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
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup({
        username: data.username,
        email: data.email,
        password: data.password,
        role: "customer",
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

                  {serverError && (
                    <Text style={{ color: "#dc2626", fontSize: 13 }}>{serverError}</Text>
                  )}

                  <Button type="submit" appearance="solid" sentiment="accented" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>

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