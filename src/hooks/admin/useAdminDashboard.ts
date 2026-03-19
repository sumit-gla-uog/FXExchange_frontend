import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

export const useAdminDashboard = () => {
  const { data, isLoading } =
    useSWR<FX.Admin.DashboardData>("/api/v1/admin/dashboard/", fetcher)

  return { data, isLoading }
}