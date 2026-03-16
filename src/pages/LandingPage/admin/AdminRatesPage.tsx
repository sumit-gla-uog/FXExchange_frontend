import { useState, useMemo, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import useSWR, { mutate } from "swr"
import { useForm, Controller } from "react-hook-form"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"

import {
    StackLayout,
    FlexLayout,
    Text,
    Card,
    Button,
    Input,
    Spinner,
    FormField,
    FormFieldLabel,
    Option,
    Dropdown,
} from "@salt-ds/core"
import {
    UploadIcon,
    EditIcon,
    SuccessTickIcon,
    ErrorIcon,
    RefreshIcon,
    ArrowLeftIcon,
} from "@salt-ds/icons"
import { useNavigate } from "react-router-dom"

ModuleRegistry.registerModules([AllCommunityModule])

interface RateRecord {
    id: number
    pair: string
    pair_id: number
    rate: string
    source: string
    updated_by: string
    as_of: string
}

interface RatesResponse {
    rates: RateRecord[]
}

interface AdminDashboardData {
    total_currencies: number
    total_rates: number
    stale_rates: number
    unavailable_rates: number
    api_status: string
    last_check: string | null
    uptime_pct: string
}

interface PairsResponse {
    pairs: { id: number; pair: string; rate: string }[]
}

interface ManualRateForm {
    pair_id: string
    rate: string
}

//Stat Card

const StatCard = ({
    label,
    value,
    sub,
    subColor,
}: {
    label: string
    value: string | number
    sub: string
    subColor?: string
}) => (
    <Card
        style={{
            flex: 1,
            minWidth: 180,
            padding: "20px 24px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
    >
        <StackLayout gap={0.5}>
            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>{label}</Text>
            <Text style={{ fontSize: 32, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}</Text>
            <Text styleAs="label" style={{ color: subColor ?? "#6b7280", fontSize: 12, fontWeight: 600 }}>{sub}</Text>
        </StackLayout>
    </Card>
)

// CSV Dropzone, I am using react-dropzone as per recent industry practices.

const CsvDropzone = ({ onUpload }: { onUpload: (file: File) => void }) => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        accept: { "text/csv": [".csv"] },
        maxFiles: 1,
        onDrop: (files) => files[0] && onUpload(files[0]),
    })

    return (
        <div
            {...getRootProps()}
            style={{
                border: `2px dashed ${isDragActive ? "#0f766e" : "#d1d5db"}`,
                borderRadius: 10,
                padding: "32px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: isDragActive ? "#f0fdf9" : "#fafafa",
                transition: "all 0.2s",
            }}
        >
            <input {...getInputProps()} />
            <UploadIcon size={2} style={{ color: "#0f766e", marginBottom: 8 }} />
            {acceptedFiles.length > 0 ? (
                <Text style={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>
                    {acceptedFiles[0].name} ready to upload
                </Text>
            ) : isDragActive ? (
                <Text style={{ color: "#0f766e", fontSize: 14 }}>Drop CSV here...</Text>
            ) : (
                <>
                    <Text style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                        Drag & drop CSV file here
                    </Text>
                    <Text styleAs="label" style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
                        or click to browse - format: pair_code, rate
                    </Text>
                </>
            )}
        </div>
    )
}

export const AdminRatesPage = () => {
    const navigate = useNavigate()
    const [activeMethod, setActiveMethod] = useState<"csv" | "manual" | null>(null)
    const [csvResult, setCsvResult] = useState<{ updated: number; errors: any[] } | null>(null)
    const [csvUploading, setCsvUploading] = useState(false)
    const [manualSuccess, setManualSuccess] = useState("")
    const [manualError, setManualError] = useState("")
      const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""
  

    const { data: dashData, isLoading: dashLoading } = useSWR<AdminDashboardData>(
        "/api/v1/admin/dashboard/",
        fetcher,
        { refreshInterval: 30000 }
    )

    const { data: ratesData, isLoading: ratesLoading } = useSWR<RatesResponse>(
        "/api/v1/admin/rates/",
        fetcher
    )

    const { data: pairsData } = useSWR<PairsResponse>(
        "/api/v1/pairs/",
        fetcher
    )

    const pairs = pairsData?.pairs ?? []
    const rates = ratesData?.rates ?? []

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ManualRateForm>({
        defaultValues: { pair_id: "", rate: "" },
    })

    const handleManualUpdate = async (values: ManualRateForm) => {
        setManualError("")
        setManualSuccess("")
        try {
            await apiFetch("/api/v1/admin/rates/manual/", {
                method: "POST",
                auth: true,
                body: JSON.stringify({ pair_id: parseInt(values.pair_id), rate: values.rate }),
            })
            setManualSuccess("Rate updated successfully")
            reset()
            mutate("/api/v1/admin/rates/")
            mutate("/api/v1/admin/dashboard/")
        } catch (e: any) {
            setManualError(e.message ?? "Failed to update rate")
        }
    }

    // CSV Upload 

    const handleCsvUpload = async (file: File) => {
        setCsvUploading(true)
        setCsvResult(null)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch(`${BASE_URL}/api/v1/admin/rates/csv/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
            })
            const data = await res.json()
            setCsvResult({ updated: data.updated, errors: data.errors ?? [] })
            mutate("/api/v1/admin/rates/")
            mutate("/api/v1/admin/dashboard/")
        } catch (e: any) {
            setCsvResult({ updated: 0, errors: [{ error: e.message }] })
        } finally {
            setCsvUploading(false)
        }
    }

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "Pair",
            field: "pair",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: any) => (
                <span style={{ fontWeight: 700, color: "#111827" }}>{p.value}</span>
            ),
        },
        {
            headerName: "Rate",
            field: "rate",
            flex: 1,
            minWidth: 110,
            valueFormatter: (p) => parseFloat(p.value).toFixed(4),
        },
        {
            headerName: "Source",
            field: "source",
            flex: 0.8,
            minWidth: 100,
            cellRenderer: (p: any) => {
                const colors: Record<string, { bg: string; color: string }> = {
                    api: { bg: "#dbeafe", color: "#1d4ed8" },
                    manual: { bg: "#fef9c3", color: "#854d0e" },
                    csv: { bg: "#dcfce7", color: "#166534" },
                }
                const s = colors[p.value] ?? { bg: "#f3f4f6", color: "#374151" }
                return (
                    <span style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: s.bg,
                        color: s.color,
                    }}>
                        {p.value}
                    </span>
                )
            },
        },
        {
            headerName: "Updated By",
            field: "updated_by",
            flex: 0.8,
            minWidth: 110,
        },
        {
            headerName: "Timestamp",
            field: "as_of",
            flex: 1.2,
            minWidth: 160,
            sort: "desc",
            valueFormatter: (p) =>
                new Date(p.value).toLocaleString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                }),
        },
    ], [])

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
    }), [])

    return (
        <StackLayout gap={3}>
            {/* Header  */}
            <button
                onClick={() => navigate("/admin/dashboard")}
                style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    padding: 0,
                    marginBottom: 8,
                }}
            >
                <ArrowLeftIcon size={1} />
                Back to Dashboard
            </button>
            <StackLayout gap={0}>

                <Text style={{ fontWeight: 700, fontSize: 22, color: "#111827" }}>Rate Management</Text>
                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
                    Monitor API health and manually update exchange rates
                </Text>
            </StackLayout>

            {/* API Health */}
            <Card style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <Text style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>API Health Status</Text>
                {dashLoading ? <Spinner /> : (
                    <FlexLayout gap={6} wrap>
                        <StackLayout gap={0}>
                            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Status</Text>
                            <FlexLayout align="center" gap={1}>
                                <SuccessTickIcon size={1} style={{ color: "#059669" }} />
                                <Text style={{ fontWeight: 700, color: "#059669", fontSize: 15 }}>Operational</Text>
                            </FlexLayout>
                        </StackLayout>
                        <StackLayout gap={0}>
                            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Last Check</Text>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>
                                {dashData?.last_check
                                    ? new Date(dashData.last_check).toLocaleString("en-GB")
                                    : "—"}
                            </Text>
                        </StackLayout>
                        <StackLayout gap={0}>
                            <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>Uptime</Text>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>{dashData?.uptime_pct ?? "—"}%</Text>
                        </StackLayout>
                    </FlexLayout>
                )}
            </Card>

            {/* Stat Cards */}
            <FlexLayout gap={2} wrap>
                <StatCard
                    label="OK Rates"
                    value={dashLoading ? "..." : (dashData?.total_rates ?? 0)}
                    sub="Rates functioning normally"
                    subColor="#059669"
                />
                <StatCard
                    label="Stale Rates"
                    value={dashLoading ? "..." : (dashData?.stale_rates ?? 0)}
                    sub="Data may be delayed"
                    subColor={dashData?.stale_rates ? "#f59e0b" : "#6b7280"}
                />
                <StatCard
                    label="Unavailable"
                    value={dashLoading ? "..." : (dashData?.unavailable_rates ?? 0)}
                    sub="Manual update needed"
                    subColor={dashData?.unavailable_rates ? "#dc2626" : "#6b7280"}
                />
            </FlexLayout>

            {/* Manual Rate Update */}
            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <Text style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Manual Rate Update</Text>
                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                    When the API fails or data is unavailable, you can manually update rates using one of these methods:
                </Text>

                {/* Method selector */}
                <FlexLayout gap={2} style={{ marginBottom: 24 }}>
                    <Card
                        onClick={() => setActiveMethod(activeMethod === "csv" ? null : "csv")}
                        style={{
                            flex: 1,
                            padding: "16px 20px",
                            borderRadius: 10,
                            border: `1px solid ${activeMethod === "csv" ? "#0f766e" : "#e5e7eb"}`,
                            background: activeMethod === "csv" ? "#f0fdf9" : "white",
                            cursor: "pointer",
                        }}
                    >
                        <FlexLayout align="center" gap={2}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 8,
                                background: "#e0f2f1", display: "flex",
                                alignItems: "center", justifyContent: "center", color: "#0f766e",
                            }}>
                                <UploadIcon size={2} />
                            </div>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 600, fontSize: 14 }}>CSV Import (Recommended)</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>Upload rates in bulk via CSV file</Text>
                            </StackLayout>
                        </FlexLayout>
                    </Card>

                    <Card
                        onClick={() => setActiveMethod(activeMethod === "manual" ? null : "manual")}
                        style={{
                            flex: 1,
                            padding: "16px 20px",
                            borderRadius: 10,
                            border: `1px solid ${activeMethod === "manual" ? "#0f766e" : "#e5e7eb"}`,
                            background: activeMethod === "manual" ? "#f0fdf9" : "white",
                            cursor: "pointer",
                        }}
                    >
                        <FlexLayout align="center" gap={2}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 8,
                                background: "#dbeafe", display: "flex",
                                alignItems: "center", justifyContent: "center", color: "#1d4ed8",
                            }}>
                                <EditIcon size={2} />
                            </div>
                            <StackLayout gap={0}>
                                <Text style={{ fontWeight: 600, fontSize: 14 }}>Manual Entry (Emergency)</Text>
                                <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>Enter a single rate manually</Text>
                            </StackLayout>
                        </FlexLayout>
                    </Card>
                </FlexLayout>

                {/* CSV Upload panel */}
                {activeMethod === "csv" && (
                    <StackLayout gap={2}>
                        <Text style={{ fontWeight: 600, fontSize: 14 }}>Upload CSV File</Text>
                        <Text styleAs="label" style={{ color: "#6b7280", fontSize: 12 }}>
                            CSV format: <code>pair_code,rate</code> — e.g., GBP/USD,1.2850
                        </Text>
                        <CsvDropzone onUpload={handleCsvUpload} />
                        {csvUploading && <FlexLayout align="center" gap={1}><Spinner size="small" /><Text>Uploading...</Text></FlexLayout>}
                        {csvResult && (
                            <div style={{
                                padding: "12px 16px", borderRadius: 8,
                                background: csvResult.errors.length ? "#fef2f2" : "#f0fdf4",
                                border: `1px solid ${csvResult.errors.length ? "#fecaca" : "#bbf7d0"}`,
                            }}>
                                <FlexLayout align="center" gap={1}>
                                    {csvResult.errors.length
                                        ? <ErrorIcon size={1} style={{ color: "#dc2626" }} />
                                        : <SuccessTickIcon size={1} style={{ color: "#059669" }} />
                                    }
                                    <Text style={{ fontSize: 13, fontWeight: 600 }}>
                                        {csvResult.updated} rate(s) updated
                                        {csvResult.errors.length ? `, ${csvResult.errors.length} error(s)` : " successfully"}
                                    </Text>
                                </FlexLayout>
                            </div>
                        )}
                    </StackLayout>
                )}

                {/* Manual Entry panel */}
                {activeMethod === "manual" && (
                    <form onSubmit={handleSubmit(handleManualUpdate)}>
                        <Text style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Enter Rate Manually</Text>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                            <FormField>
                                <FormFieldLabel>Currency Pair</FormFieldLabel>
                                <Controller
                                    name="pair_id"
                                    control={control}
                                    rules={{ required: "Pair is required" }}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Dropdown
                                                selected={field.value ? [field.value] : []}
                                                onSelectionChange={(_, items) => field.onChange(items[0] ?? "")}
                                                placeholder="Select pair"
                                                style={{ width: "100%" }}
                                            >
                                                {pairs.map((p) => (
                                                    <Option key={p.id} value={String(p.id)}>{p.pair}</Option>
                                                ))}
                                            </Dropdown>
                                            {fieldState.error && (
                                                <Text style={{ color: "#dc2626", fontSize: 11 }}>{fieldState.error.message}</Text>
                                            )}
                                        </>
                                    )}
                                />
                            </FormField>

                            <FormField>
                                <FormFieldLabel>Exchange Rate</FormFieldLabel>
                                <Controller
                                    name="rate"
                                    control={control}
                                    rules={{ required: "Rate is required" }}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input {...field} placeholder="e.g., 1.2345" type="number" />
                                            {fieldState.error && (
                                                <Text style={{ color: "#dc2626", fontSize: 11 }}>{fieldState.error.message}</Text>
                                            )}
                                        </>
                                    )}
                                />
                            </FormField>
                        </div>

                        {manualError && <Text style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{manualError}</Text>}
                        {manualSuccess && <Text style={{ color: "#059669", fontSize: 13, marginBottom: 12 }}>{manualSuccess}</Text>}

                        <FlexLayout gap={1}>
                            <Button
                                appearance="bordered"
                                type="button"
                                onClick={() => { setActiveMethod(null); reset(); setManualError(""); setManualSuccess("") }}
                                style={{ borderRadius: 8 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="solid"
                                type="submit"
                                disabled={isSubmitting}
                                style={{ background: "#0f766e", color: "white", borderRadius: 8, fontWeight: 600 }}
                            >
                                {isSubmitting ? "Updating..." : "Update Rate"}
                            </Button>
                        </FlexLayout>
                    </form>
                )}
            </Card>

            {/* Recent Rate Updates */}
            <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <FlexLayout justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: 700, fontSize: 16 }}>Recent Rate Updates</Text>
                    <Button
                        appearance="transparent"
                        onClick={() => mutate("/api/v1/admin/rates/")}
                        style={{ color: "#0f766e" }}
                    >
                        <RefreshIcon size={1} />
                    </Button>
                </FlexLayout>

                {ratesLoading ? (
                    <FlexLayout justify="center" style={{ padding: 40 }}>
                        <Spinner />
                    </FlexLayout>
                ) : rates.length === 0 ? (
                    <Text style={{ color: "#9ca3af", fontSize: 13 }}>No rate updates yet.</Text>
                ) : (
                    <div className="ag-theme-alpine" style={{ width: "100%", height: 400 }}>
                        <AgGridReact
                            rowData={rates}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowHeight={52}
                            headerHeight={46}
                            suppressMovableColumns
                            suppressCellFocus
                            getRowId={(p) => String(p.data.id)}
                        />
                    </div>
                )}
            </Card>
        </StackLayout>
    )
}