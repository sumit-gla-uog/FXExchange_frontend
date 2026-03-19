//Todo create an env file for different environment
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export const getAccessToken = () =>{
    return localStorage.getItem("access_token")
}

export const setTokens = (tokens :{access :string, refresh:string}) =>{

    localStorage.setItem("access_token",tokens.access)
    localStorage.setItem("refresh_token",tokens.refresh)
}

export const clearTokens = () =>{
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

export const apiFetch = async <T>(
    path: string,
    options: RequestInit & { auth?: boolean } = {}
  ): Promise<T> => {
    const { auth = false, ...init } = options;
  
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  
    if (auth) {
      const token = getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
  
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

     // It will auto-refresh on 401 not authorised status code
  if (res.status === 401 && auth) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("Session expired. Please login again.");

    // This will try to get a new access token
    const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) {
      // when refresh will also fail then clear the previous tokens and force login
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    const { access } = await refreshRes.json();
    localStorage.setItem("access_token", access);

    // iT WILL retry original request with new token
    headers.set("Authorization", `Bearer ${access}`);
    const retryRes = await fetch(`${API_BASE}${path}`, { ...init, headers });
    const retryText = await retryRes.text();
    const retryData = retryText ? JSON.parse(retryText) : null;
    if (!retryRes.ok) throw new Error(retryData?.detail || retryData?.error || `Request failed (${retryRes.status})`);
    return retryData as T;
  }

  
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
  
    if (!res.ok) {
      const msg = data?.detail || data?.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }
  
    return data as T;
  }