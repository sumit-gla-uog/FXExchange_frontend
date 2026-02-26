import { apiFetch } from "./client";

export const fetcher = (url: string) => apiFetch(url, { auth: true });