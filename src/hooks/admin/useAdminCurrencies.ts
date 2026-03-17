import useSWR, { mutate } from "swr"
import { fetcher } from "../../api/swr"
import { apiFetch } from "../../api/client"
import type { FX } from "../../types/FX"

export const useAdminCurrencies = () => {
  const { data, isLoading } =
    useSWR<FX.Shared.CurrenciesResponse>("/api/v1/admin/currencies/", fetcher)

  const currencies = data?.currencies ?? []

  const handleAdd = async (values: { code: string; name: string; symbol: string; flag: string }) => {
    await apiFetch("/api/v1/admin/currencies/add/", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        code: values.code.toUpperCase(),
        name: values.name,
        symbol: values.symbol,
        flag: values.flag,
      }),
    })
    mutate("/api/v1/admin/currencies/")
  }

  const handleToggle = async (id: number) => {
    await apiFetch(`/api/v1/admin/currencies/${id}/toggle/`, { method: "PATCH", auth: true })
    mutate("/api/v1/admin/currencies/")
  }

  return { currencies, isLoading, handleAdd, handleToggle }
}