// import { useEffect,useState } from "react";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import { logout,me } from "../../api/auth";
import { fetcher } from "../../api/swr";
import { getAccessToken } from "../../api/client";

export type User = {
  id:number
  username:string
  email:string
  role:string
}

export const AdminLandingPage = () => {
  const navigate = useNavigate();
  const token = getAccessToken();
  
  
  const { data, error, isLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher);

    if (isLoading) return <p>Loading...</p>;
  

    if (error || !data.user) {
      logout();
      navigate("/login", { replace: true });
      return null;
    }

    const user = data.user as User;

   // Role guard so that customer dont land on admin page
   if (user.role !== "admin") {
    navigate("/login", { replace: true });
    return null;
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  };


  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Landing</h1>
      {user && (
        <>
          <p>Welcome, {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      )}

      <button onClick={handleLogout} style={{ marginTop: 16 }}>
        Logout
      </button>
    </div>
  );
}