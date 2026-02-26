import { apiFetch,setTokens,clearTokens } from "./client";

export type Tokens = {
    access:string
    refresh:string
}

export const login = async(username:string,password:string) =>{
    const tokens = await apiFetch<Tokens>("/api/v1/auth/login/", {
        method:"POST",
        body:JSON.stringify({username,password})
    })
    setTokens(tokens)
    return tokens;

}

export const me = async() =>{

    return apiFetch<{ user: { id: number; username: string; email: string; role: string } }>(
        "/api/v1/auth/me/",
        { method: "GET", auth: true }
      );
    
}

export const logout = async() =>{
clearTokens()
}