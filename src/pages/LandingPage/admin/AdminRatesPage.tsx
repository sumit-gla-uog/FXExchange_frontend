import { useState, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import useSWR, { mutate } from "swr"
import { useForm, Controller } from "react-hook-form"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"
import { StackLayout, FlexLayout, Text, Card, Button, Input, Spinner, FormField, FormFieldLabel, Option, Dropdown } from "@salt-ds/core"
import { UploadIcon, EditIcon, SuccessTickIcon, ErrorIcon, RefreshIcon, ArrowLeftIcon } from "@salt-ds/icons"
import { useNavigate } from "react-router-dom"
import type { FX } from "../../../types/FX"
import "./AdminRatesPage.css"

ModuleRegistry.registerModules([AllCommunityModule])

interface ManualRateForm { pair_id: string; rate: string }

const StatCard = ({ label, value, sub, subColor }: { label: string; value: string | number; sub: string; subColor?: string }) => (
    <Card className="rates-stat-card">
        <StackLayout gap={1}>
            <Text styleAs="label" className="rates-stat-card__label">{label}</Text>
            <Text className="rates-stat-card__value">{value}</Text>
            <Text styleAs="label" className="rates-stat-card__sub" style={{ color: subColor ?? "#6b7280" }}>{sub}</Text>
        </StackLayout>
    </Card>
)

const CsvDropzone = ({ onUpload }: { onUpload: (file: File) => void }) => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        accept: { "text/csv": [".csv"] }, maxFiles: 1,
        onDrop: (files) => files[0] && onUpload(files[0]),
    })
    return (
        <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? "#0f766e" : "#d1d5db"}`, borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: isDragActive ? "#f0fdf9" : "#fafafa", transition: "all 0.2s" }}>
            <input {...getInputProps()} />
            <UploadIcon size={2} style={{ color: "#0f766e", marginBottom: 8 }} />
            {acceptedFiles.length > 0 ? (
                <Text style={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>{acceptedFiles[0].name} ready to upload</Text>
            ) : isDragActive ? (
                <Text style={{ color: "#0f766e", fontSize: 14 }}>Drop CSV here...</Text>
            ) : (
                <>
                    <Text style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Drag & drop CSV file here</Text>
                    <Text styleAs="label" style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>or click to browse — format: pair_code, rate</Text>
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

    const { data: dashData, isLoading: dashLoading } = useSWR<FX.Admin.DashboardData>("/api/v1/admin/dashboard/", fetcher)
    const { data: ratesData, isLoading: ratesLoading } = useSWR<FX.Admin.RatesResponse>("/api/v1/admin/rates/", fetcher)
    const { data: pairsData } = useSWR<FX.Admin.AdminPairsResponse>("/api/v1/pairs/", fetcher)

    const pairs = pairsData?.pairs ?? []
    const rates = ratesData?.rates ?? []

    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<ManualRateForm>({ defaultValues: { pair_id: "", rate: "" } })

    const handleManualUpdate = async (values: ManualRateForm) => {
        setManualError(""); setManualSuccess("")
        try {
            await apiFetch("/api/v1/admin/rates/manual/", { method: "POST", auth: true, body: JSON.stringify({ pair_id: parseInt(values.pair_id), rate: values.rate }) })
            setManualSuccess("Rate updated successfully")
            reset(); mutate("/api/v1/admin/rates/"); mutate("/api/v1/admin/dashboard/")
        } catch (e: any) { setManualError(e.message ?? "Failed to update rate") }
    }

    const handleCsvUpload = async (file: File) => {
        setCsvUploading(true); setCsvResult(null)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch(`${BASE_URL}/api/v1/admin/rates/csv/`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: formData })
            const data = await res.json()
            setCsvResult({ updated: data.updated, errors: data.errors ?? [] })
            mutate("/api/v1/admin/rates/"); mutate("/api/v1/admin/dashboard/")
        } catch (e: any) { setCsvResult({ updated: 0, errors: [{ error: e.message }] }) }
        finally { setCsvUploading(false) }
    }

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Pair", field: "pair", flex: 1, minWidth: 120, cellRenderer: (p: any) => <span className="rates-cell-code">{p.value}</span> },
        { headerName: "Rate", field: "rate", flex: 1, minWidth: 110, valueFormatter: (p) => parseFloat(p.value).toFixed(4) },
        {
            headerName: "Source", field: "source", flex: 0.8, minWidth: 100,
            cellRenderer: (p: any) => {
                const c: Record<string, { bg: string; color: string }> = { api: { bg: "#dbeafe", color: "#1d4ed8" }, manual: { bg: "#fef9c3", color: "#854d0e" }, csv: { bg: "#dcfce7", color: "#166534" } }
                const s = c[p.value] ?? { bg: "#f3f4f6", color: "#374151" }
                return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{p.value}</span>
            },
        },
        { headerName: "Updated By", field: "updated_by", flex: 0.8, minWidth: 110 },
        { headerName: "Timestamp", field: "as_of", flex: 1.2, minWidth: 160, sort: "desc", valueFormatter: (p) => new Date(p.value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
    ], [])

    const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true }), [])

    return (
        <StackLayout gap={3}>
            <button className="rates-back-btn" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeftIcon size={1} /> Back to Dashboard
            </button>

            <StackLayout gap={2}>
                <Text className="rates-page-title">Rate Management</Text>
                <Text styleAs="label" className="rates-page-subtitle">Monitor API health and manually update exchange rates</Text>
            </StackLayout>

            <Card className="rates-card--compact">
                <Text className="rates-section-title">API Health Status</Text>
                {dashLoading ? <Spinner /> : (
                    <FlexLayout gap={6} wrap>
                        <StackLayout gap={1}>
                            <Text styleAs="label" className="rates-page-subtitle">Status</Text>
                            <FlexLayout align="center" gap={1}>
                                <Text style={{ fontWeight: 700, color: "#059669", fontSize: 15 }}>Operational</Text>
                            </FlexLayout>
                        </StackLayout>
                        <StackLayout gap={1}>
                            <Text styleAs="label" className="rates-page-subtitle">Last Check</Text>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>{dashData?.last_check ? new Date(dashData.last_check).toLocaleString("en-GB") : "—"}</Text>
                        </StackLayout>
                        <StackLayout gap={1}>
                            <Text styleAs="label" className="rates-page-subtitle">Uptime</Text>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>{dashData?.uptime_pct ?? "—"}%</Text>
                        </StackLayout>
                    </FlexLayout>
                )}
            </Card>

            <FlexLayout gap={2} wrap>
                <StatCard label="OK Rates" value={dashLoading ? "..." : (dashData?.total_rates ?? 0)} sub="Rates functioning normally" subColor="#059669" />
                <StatCard label="Stale Rates" value={dashLoading ? "..." : (dashData?.stale_rates ?? 0)} sub="Data may be delayed" subColor={dashData?.stale_rates ? "#f59e0b" : "#6b7280"} />
                <StatCard label="Unavailable" value={dashLoading ? "..." : (dashData?.unavailable_rates ?? 0)} sub="Manual update needed" subColor={dashData?.unavailable_rates ? "#dc2626" : "#6b7280"} />
            </FlexLayout>

            <Card className="rates-card">
                <Text className="rates-section-title">Manual Rate Update</Text>
                <Text styleAs="label" className="rates-section-subtitle">When the API fails or data is unavailable, you can manually update rates using one of these methods:</Text>

                <div className="rates-method-cards">
                    <Card className="rates-method-card" onClick={() => setActiveMethod(activeMethod === "csv" ? null : "csv")} style={{ border: `1px solid ${activeMethod === "csv" ? "#0f766e" : "#e5e7eb"}`, background: activeMethod === "csv" ? "#f0fdf9" : "white" }}>
                        <FlexLayout align="center" gap={2}>
                            <div className="rates-method-card__icon rates-method-card_icon--csv"><UploadIcon size={2} /></div>
                            <StackLayout gap={1}>
                                <Text className="rates-method-card__title">CSV Import (Recommended)</Text>
                                <Text styleAs="label" className="rates-method-card__subtitle">Upload rates in bulk via CSV file</Text>
                            </StackLayout>
                        </FlexLayout>
                    </Card>
                    <Card className="rates-method-card" onClick={() => setActiveMethod(activeMethod === "manual" ? null : "manual")} style={{ border: `1px solid ${activeMethod === "manual" ? "#0f766e" : "#e5e7eb"}`, background: activeMethod === "manual" ? "#f0fdf9" : "white" }}>
                        <FlexLayout align="center" gap={2}>
                            <div className="rates-method-card__icon rates-method-card__icon--manual"><EditIcon size={2} /></div>
                            <StackLayout gap={1}>
                                <Text className="rates-method-card__title">Manual Entry (Emergency)</Text>
                                <Text styleAs="label" className="rates-method-card__subtitle">Enter a single rate manually</Text>
                            </StackLayout>
                        </FlexLayout>
                    </Card>
                </div>

                {activeMethod === "csv" && (
                    <StackLayout gap={2}>
                        <Text className="rates-method-card__title">Upload CSV File</Text>
                        <Text styleAs="label" className="rates-method-card__subtitle">CSV format: <code>pair_code,rate</code> — e.g., GBP/USD,1.2850</Text>
                        <CsvDropzone onUpload={handleCsvUpload} />
                        {csvUploading && <FlexLayout align="center" gap={1}><Spinner size="small" /><Text>Uploading...</Text></FlexLayout>}
                        {csvResult && (
                            <div style={{ padding: "12px 16px", borderRadius: 8, background: csvResult.errors.length ? "#fef2f2" : "#f0fdf4", border: `1px solid ${csvResult.errors.length ? "#fecaca" : "#bbf7d0"}` }}>
                                <FlexLayout align="center" gap={1}>
                                    {csvResult.errors.length ? <ErrorIcon size={1} style={{ color: "#dc2626" }} /> : <SuccessTickIcon size={1} style={{ color: "#059669" }} />}
                                    <Text style={{ fontSize: 13, fontWeight: 600 }}>{csvResult.updated} rate(s) updated{csvResult.errors.length ? `, ${csvResult.errors.length} error(s)` : " successfully"}</Text>
                                </FlexLayout>
                            </div>
                        )}
                    </StackLayout>
                )}

                {activeMethod === "manual" && (
                    <form onSubmit={handleSubmit(handleManualUpdate)}>
                        <Text className="rates-method-card__title" style={{ marginBottom: 16 }}>Enter Rate Manually</Text>
                        <div className="rates-form-grid">
                            <FormField>
                                <FormFieldLabel>Currency Pair</FormFieldLabel>
                                <Controller name="pair_id" control={control} rules={{ required: "Pair is required" }}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Dropdown selected={field.value ? [field.value] : []} onSelectionChange={(_, items) => field.onChange(items[0] ?? "")} placeholder="Select pair" style={{ width: "100%" }}>
                                                {pairs.map((p) => <Option key={p.id} value={String(p.id)}>{p.pair}</Option>)}
                                            </Dropdown>
                                            {fieldState.error && <Text className="rates-form-error">{fieldState.error.message}</Text>}
                                        </>
                                    )}
                                />
                            </FormField>
                            <FormField>
                                <FormFieldLabel>Exchange Rate</FormFieldLabel>
                                <Controller name="rate" control={control} rules={{ required: "Rate is required" }}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input {...field} placeholder="e.g., 1.2345" type="number" />
                                            {fieldState.error && <Text className="rates-form-error">{fieldState.error.message}</Text>}
                                        </>
                                    )}
                                />
                            </FormField>
                        </div>
                        {manualError && <Text className="rates-form-feedback--error">{manualError}</Text>}
                        {manualSuccess && <Text className="rates-form-feedback--success">{manualSuccess}</Text>}
                        <FlexLayout gap={1}>
                            <Button appearance="bordered" type="button" className="rates-form-btn--cancel" onClick={() => { setActiveMethod(null); reset(); setManualError(""); setManualSuccess("") }}>Cancel</Button>
                            <Button appearance="solid" type="submit" className="rates-form-btn--submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Rate"}</Button>
                        </FlexLayout>
                    </form>
                )}
            </Card>

            <Card className="rates-card">
                <FlexLayout justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text className="rates-section-title" style={{ marginBottom: 0 }}>Recent Rate Updates</Text>
                    <Button appearance="transparent" onClick={() => mutate("/api/v1/admin/rates/")} style={{ color: "#0f766e" }}><RefreshIcon size={1} /></Button>
                </FlexLayout>
                {ratesLoading ? (
                    <div className="rates-spinner"><Spinner /></div>
                ) : rates.length === 0 ? (
                    <Text className="rates-empty">No rate updates yet.</Text>
                ) : (
                    <div className="ag-theme-alpine" style={{ width: "100%", height: 400 }}>
                        <AgGridReact rowData={rates} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={52} headerHeight={46} suppressMovableColumns suppressCellFocus getRowId={(p) => String(p.data.id)} />
                    </div>
                )}
            </Card>
        </StackLayout>
    )
}