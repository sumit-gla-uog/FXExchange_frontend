import useSWRMutation from "swr/mutation"
import { mutate } from "swr"

export type DepositPayload = {
  amount: string
  bank_name: string
  account_number: string
  sort_code: string
}

export type DepositResult = {
  ok: boolean
  message: string
  deposit: {
    amount: string
    currency: string
    new_balance: string
  }
}

const depositFetcher = async (url: string, { arg }: { arg: DepositPayload }): Promise<DepositResult> => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}${url}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(arg),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error ?? "Deposit failed")
  return data
}

export const useDeposit = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/v1/portfolio/deposit/",
    depositFetcher
  )

  const deposit = async (payload: DepositPayload): Promise<DepositResult> => {
    const result = await trigger(payload)
    // Revalidate portfolio and dashboard after deposit
    mutate("/api/v1/portfolio/")
    mutate("/api/v1/dashboard/summary/")
    return result!
  }

  return {
    deposit,
    isLoading: isMutating,
    error: error?.message ?? null,
  }
}