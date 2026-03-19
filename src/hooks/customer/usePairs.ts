import { useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "../../api/swr"
import type { FX } from "../../types/FX"

const calcSpread = (rate: string) => (parseFloat(rate) * 0.0003).toFixed(4)

export const usePairs = (search: string) => {
  const { data, isLoading } = useSWR<FX.Customer.PairsResponse>(
    `/api/v1/pairs/${search ? `?search=${search}` : ""}`, fetcher
  )

  const pairs = data?.pairs ?? []

  const rowData = useMemo(() =>
    pairs.map((p) => ({ ...p, rate_num: parseFloat(p.rate), spread: calcSpread(p.rate) })),
    [pairs]
  )

  return { pairs, rowData, isLoading }
}