import { Navigate, useLocation } from "react-router-dom"
import { getAccessToken } from "../api/client"

export  const RequireAuth = ({ children }: { children: React.ReactNode }) =>{
  const token = getAccessToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}