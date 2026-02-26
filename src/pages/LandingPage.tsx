// import { useEffect,useState } from "react";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import { logout,me } from "../api/auth";
import { fetcher } from "../api/swr";
import { getAccessToken } from "../api/client";

export type User = {
  id:number
  username:string
  email:string
  role:string
}

export const LandingPage = () => {
  const navigate = useNavigate();
  const token = getAccessToken();
  // const [user,setUser] = useState<User | null>(null)
  // const [loading,setLoading]= useState(true)
  const { data, error, isLoading } = useSWR(
    token ? "/api/v1/auth/me/" : null,
    fetcher);


  if (error) {
    logout();
    navigate("/login");
    return null;
  }

  
  // useEffect(() =>{
  //   me()
  //   .then((res) =>{
  //     setUser(res.user)
  //   })
  //   .catch(() =>{
  //     logout()
  //     navigate("/login")
  //   })
  //   .finally(() => setLoading(false))
  // },[])

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