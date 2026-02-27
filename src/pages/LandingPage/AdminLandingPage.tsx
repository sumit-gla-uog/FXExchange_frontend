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


  if (error) {
    logout();
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  };

  if (isLoading) return <p>Loading...</p>;

  const user = data.user as User;

  return (
    <div style={{ padding: 32 }}>
      <h1>Landing</h1>
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