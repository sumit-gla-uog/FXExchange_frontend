import { apiFetch } from "./client";

// export const fetcher = (url: string) => apiFetch(url, { auth: true });
export const fetcher = <T>(url: string): Promise<T> =>
    apiFetch<T>(url, { auth: true })
  