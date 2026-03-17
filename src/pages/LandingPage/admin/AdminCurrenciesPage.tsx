import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import useSWR, { mutate } from "swr"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { fetcher } from "../../../api/swr"
import { apiFetch } from "../../../api/client"
import { StackLayout, FlexLayout, Text, Card, Button, Input, Spinner, FormField, FormFieldLabel } from "@salt-ds/core"
import { AddIcon, CloseIcon, BooleanIcon, BooleanSolidIcon, ArrowLeftIcon } from "@salt-ds/icons"
import { useNavigate } from "react-router-dom"
import type { FX } from "../../../types/FX"
import "./AdminCurrenciesPage.css"

export const AdminCurrenciesPage = () => {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { code: "", name: "", symbol: "", flag: "" },
  })

  const { data, isLoading } = useSWR<FX.Shared.CurrenciesResponse>("/api/v1/admin/currencies/", fetcher)
  const currencies = data?.currencies ?? []

  const columnDefs = useMemo<ColDef[]>(() => [
    { headerName: "Flag", field: "flag", flex: 0.5, minWidth: 80, sortable: false, cellRenderer: (p: ICellRendererParams) => <span className="currencies-cell-flag">{p.value}</span> },
    { headerName: "Code", field: "code", flex: 0.7, minWidth: 90, cellRenderer: (p: ICellRendererParams) => <span className="currencies-cell-code">{p.value}</span> },
    { headerName: "Name", field: "name", flex: 1.5, minWidth: 160 },
    { headerName: "Symbol", field: "symbol", flex: 0.6, minWidth: 90 },
    {
      headerName: "Status", field: "enabled", flex: 0.8, minWidth: 110,
      cellRenderer: (p: ICellRendererParams) => (
        <span className={p.value ? "currencies-badge--enabled" : "currencies-badge--disabled"}>
          {p.value ? "Enabled" : "Disabled"}
        </span>
      ),
    },
    {
      headerName: "Actions", field: "id", flex: 0.8, minWidth: 120, sortable: false,
      cellRenderer: (p: ICellRendererParams) => (
        <button className="currencies-cell-toggle" onClick={() => handleToggle(p.value, p.data.enabled)}>
          {p.data.enabled ? <BooleanSolidIcon size={1} /> : <BooleanIcon size={1} />}
          {p.data.enabled ? "Disable" : "Enable"}
        </button>
      ),
    },
  ], [currencies])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true }), [])

  const handleAdd = async (values: { code: string; name: string; symbol: string; flag: string }) => {
    setError(""); setSuccess("")
    try {
      await apiFetch("/api/v1/admin/currencies/add/", { method: "POST", auth: true, body: JSON.stringify({ code: values.code.toUpperCase(), name: values.name, symbol: values.symbol, flag: values.flag }) })
      setSuccess(`${values.code.toUpperCase()} added successfully`)
      reset(); setShowForm(false)
      mutate("/api/v1/admin/currencies/")
    } catch (e: any) { setError(e.message ?? "Failed to add currency") }
  }

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    try {
      await apiFetch(`/api/v1/admin/currencies/${id}/toggle/`, { method: "PATCH", auth: true })
      mutate("/api/v1/admin/currencies/")
    } catch (e: any) { console.error("Toggle failed", e) }
  }

  return (
    <StackLayout gap={3}>
      <button className="currencies-back-btn" onClick={() => navigate("/admin/dashboard")}>
        <ArrowLeftIcon size={1} /> Back to Dashboard
      </button>

      <div className="currencies-header">
        <StackLayout gap={2}>
          <Text className="currencies-header_title">Currency Management</Text>
          <Text styleAs="label" className="currencies-header__subtitle">Manage supported currencies for FX exchange</Text>
        </StackLayout>
        <Button appearance="solid" className="currencies-header__btn" onClick={() => { setShowForm(!showForm); setError(""); setSuccess("") }}>
          <AddIcon size={1} /> Add Currency
        </Button>
      </div>

      {showForm && (
        <Card className="currencies-form-card">
          <div className="currencies-form-header">
            <Text className="currencies-form-header__title">Add New Currency</Text>
            <Button appearance="transparent" onClick={() => { setShowForm(false); setError(""); setSuccess("") }}>
              <CloseIcon size={1} />
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleAdd)}>
            <div className="currencies-form-grid">
              <FormField>
                <FormFieldLabel>Currency Code *</FormFieldLabel>
                <Controller name="code" control={control} rules={{ required: "Code is required", maxLength: { value: 3, message: "Max 3 characters" } }}
                  render={({ field, fieldState }) => (
                    <><Input {...field} placeholder="e.g., USD" />
                      {fieldState.error && <Text className="currencies-form-error">{fieldState.error.message}</Text>}</>
                  )}
                />
              </FormField>
              <FormField>
                <FormFieldLabel>Currency Name *</FormFieldLabel>
                <Controller name="name" control={control} rules={{ required: "Name is required" }}
                  render={({ field, fieldState }) => (
                    <><Input {...field} placeholder="e.g., US Dollar" />
                      {fieldState.error && <Text className="currencies-form-error">{fieldState.error.message}</Text>}</>
                  )}
                />
              </FormField>
            </div>

            <div className="currencies-form-grid" style={{ marginBottom: 20 }}>
              <FormField>
                <FormFieldLabel>Symbol *</FormFieldLabel>
                <Controller name="symbol" control={control} rules={{ required: "Symbol is required" }}
                  render={({ field, fieldState }) => (
                    <><Input {...field} placeholder="e.g., $" />
                      {fieldState.error && <Text className="currencies-form-error">{fieldState.error.message}</Text>}</>
                  )}
                />
              </FormField>
              <FormField>
                <FormFieldLabel>Flag Emoji</FormFieldLabel>
                <Controller name="flag" control={control}
                  render={({ field }) => <Input {...field} placeholder="e.g., 🇺🇸" />}
                />
              </FormField>
            </div>

            {error && <Text className="currencies-form-feedback--error">{error}</Text>}
            {success && <Text className="currencies-form-feedback--success">{success}</Text>}

            <FlexLayout gap={1} className="currencies-form-actions">
              <Button appearance="bordered" type="button" className="currencies-form-btn--cancel" onClick={() => { setShowForm(false); setError(""); setSuccess(""); reset() }}>Cancel</Button>
              <Button appearance="solid" type="submit" className="currencies-form-btn--submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Currency"}</Button>
            </FlexLayout>
          </form>
        </Card>
      )}

      <Card className="currencies-table-card">
        {isLoading ? (
          <div className="currencies-spinner"><Spinner /></div>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 480 }}>
            <AgGridReact rowData={currencies} columnDefs={columnDefs} defaultColDef={defaultColDef} rowHeight={52} headerHeight={46} suppressMovableColumns suppressCellFocus getRowId={(p) => String(p.data.id)} />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}