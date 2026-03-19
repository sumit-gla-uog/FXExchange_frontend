import useSWR, { mutate } from "swr"
import { fetcher } from "../../api/swr"
import { apiFetch } from "../../api/client"
import type { FX } from "../../types/FX"

export const useAdminRates = () => {
  const { data: dashData, isLoading: dashLoading } =
    useSWR<FX.Admin.DashboardData>("/api/v1/admin/dashboard/", fetcher, { refreshInterval: 30000 })

  const { data: ratesData, isLoading: ratesLoading } =
    useSWR<FX.Admin.RatesResponse>("/api/v1/admin/rates/", fetcher)

  const { data: pairsData } =
    useSWR<FX.Admin.AdminPairsResponse>("/api/v1/pairs/", fetcher)

  const pairs = pairsData?.pairs ?? []
  const rates = ratesData?.rates ?? []

  const handleManualUpdate = async (values: { pair_id: string; rate: string }) => {
    await apiFetch("/api/v1/admin/rates/manual/", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ pair_id: parseInt(values.pair_id), rate: values.rate }),
    })
    mutate("/api/v1/admin/rates/")
    mutate("/api/v1/admin/dashboard/")
  }

  const handleCsvUpload = async (file: File, baseUrl: string): Promise<{ updated: number; errors: any[] }> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${baseUrl}/api/v1/admin/rates/csv/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      body: formData,
    })
    const data = await res.json()
    mutate("/api/v1/admin/rates/")
    mutate("/api/v1/admin/dashboard/")
    return { updated: data.updated, errors: data.errors ?? [] }
  }

  const refreshRates = () => mutate("/api/v1/admin/rates/")

  return {
    dashData, dashLoading,
    rates, ratesLoading,
    pairs,
    handleManualUpdate,
    handleCsvUpload,
    refreshRates,
  }
}