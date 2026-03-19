import useSWR from "swr"
import { useNavigate } from "react-router-dom"
import { fetcher } from "../api/swr"
import { getAccessToken } from "../api/client"

export const useSelectRole = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  const { data, isLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher
  )

  const isAdmin   = data?.user?.role === "admin"
  const username  = data?.user?.username ?? ""

  const pick = (role: "customer" | "admin") => {
    if (role === "admin" && !isAdmin) {
      alert("You don't have admin access.")
      return
    }
    localStorage.setItem("active_role", role)
    navigate(role === "customer" ? "/customer" : "/admin", { replace: true })
  }

  return { username, isAdmin, isLoading, pick }
}