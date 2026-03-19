import { apiFetch } from "./client"

export const fetcher = <T>(url: string): Promise<T> =>
    apiFetch<T>(url, { auth: true })
  