import useSWRMutation from "swr/mutation"

export type SignupPayload = {
  username: string
  email: string
  password: string
  role: "customer" | "admin"
}

const signupFetcher = async (url: string, { arg }: { arg: SignupPayload }) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}${url}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error ?? "Signup failed")
  return data
}

export const useSignup = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/v1/auth/signup/",
    signupFetcher
  )

  const signup = async (payload: SignupPayload) => {
    await trigger(payload)
  }

  return {
    signup,
    isLoading: isMutating,
    error: error?.message ?? null,
  }
}