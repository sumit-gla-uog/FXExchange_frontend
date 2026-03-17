import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import useSWR, { mutate } from "swr"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
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
} from "@salt-ds/core"
import {
  AddIcon,
  CloseIcon,
  BooleanIcon,
  BooleanSolidIcon,
  ArrowLeftIcon,
} from "@salt-ds/icons"
import { useNavigate } from "react-router-dom"
import type { FX } from "../../../types/FX"

ModuleRegistry.registerModules([AllCommunityModule])

export const AdminCurrenciesPage = () => {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { code: "", name: "", symbol: "", flag: "" },
  })

  const { data, isLoading } = useSWR<FX.Shared.CurrenciesResponse>(
    "/api/v1/admin/currencies/",
    fetcher
  )

  const currencies = data?.currencies ?? []

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: "Flag",
      field: "flag",
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      cellRenderer: (p: ICellRendererParams) => (
        <span style={{ fontSize: 22 }}>{p.value}</span>
      ),
    },
    {
      headerName: "Code",
      field: "code",
      flex: 0.7,
      minWidth: 90,
      cellRenderer: (p: ICellRendererParams) => (
        <span style={{ fontWeight: 700, color: "#111827" }}>{p.value}</span>
      ),
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 160,
    },
    {
      headerName: "Symbol",
      field: "symbol",
      flex: 0.6,
      minWidth: 90,
    },
    {
      headerName: "Status",
      field: "enabled",
      flex: 0.8,
      minWidth: 110,
      cellRenderer: (p: ICellRendererParams) => (
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: p.value ? "#dcfce7" : "#fee2e2",
            color: p.value ? "#166534" : "#991b1b",
          }}
        >
          {p.value ? "Enabled" : "Disabled"}
        </span>
      ),
    },
    {
      headerName: "Actions",
      field: "id",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      cellRenderer: (p: ICellRendererParams) => {
        const enabled = p.data.enabled
        return (
          <button
            onClick={() => handleToggle(p.value, enabled)}
            style={{
              background: "none",
              border: "none",
              color: "#0f766e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
            }}
          >
            {enabled ? <BooleanSolidIcon size={1} /> : <BooleanIcon size={1} />}
            {enabled ? "Disable" : "Enable"}
          </button>
        )
      },
    },
  ], [currencies])

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
  }), [])

  // Adding Currency

  const handleAdd = async (values: { code: string; name: string; symbol: string; flag: string }) => {
    setError("")
    setSuccess("")
    try {
      await apiFetch("/api/v1/admin/currencies/add/", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          code: values.code.toUpperCase(),
          name: values.name,
          symbol: values.symbol,
          flag: values.flag,
        }),
      })
      setSuccess(`${values.code.toUpperCase()} added successfully`)
      reset()
      setShowForm(false)
      mutate("/api/v1/admin/currencies/")
    } catch (e: any) {
      setError(e.message ?? "Failed to add currency")
    }
  }

  // Toggling Enable/Disable for currencies

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    try {
      await apiFetch(`/api/v1/admin/currencies/${id}/toggle/`, {
        method: "PATCH",
        auth: true,
      })
      mutate("/api/v1/admin/currencies/")
    } catch (e: any) {
      console.error("Toggle failed", e)
    }
  }

  return (
    <StackLayout gap={3}>
      {/* Header */}
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
      <FlexLayout justify="space-between" align="center" wrap style={{ gap: 12 }}>
        <StackLayout gap={0}>
          <Text style={{ fontWeight: 700, fontSize: 22, color: "#111827" }}>
            Currency Management
          </Text>
          <Text styleAs="label" style={{ color: "#6b7280", fontSize: 13 }}>
            Manage supported currencies for FX exchange
          </Text>
        </StackLayout>
        <Button
          appearance="solid"
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess("") }}
          style={{ background: "#0f766e", color: "white", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          <AddIcon size={1} />
          Add Currency
        </Button>
      </FlexLayout>

      {/* Add Currency Form*/}
      {showForm && (
        <Card style={{ padding: "24px 28px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <FlexLayout justify="space-between" align="center" style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 700, fontSize: 16 }}>Add New Currency</Text>
            <Button appearance="transparent" onClick={() => { setShowForm(false); setError(""); setSuccess("") }}>
              <CloseIcon size={1} />
            </Button>
          </FlexLayout>

          <form onSubmit={handleSubmit(handleAdd)}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
              <FormField>
                <FormFieldLabel>Currency Code *</FormFieldLabel>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: "Code is required", maxLength: { value: 3, message: "Max 3 characters" } }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="e.g., USD" />
                      {fieldState.error && (
                        <Text style={{ color: "#dc2626", fontSize: 11 }}>{fieldState.error.message}</Text>
                      )}
                    </>
                  )}
                />
              </FormField>

              <FormField>
                <FormFieldLabel>Currency Name *</FormFieldLabel>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="e.g., US Dollar" />
                      {fieldState.error && (
                        <Text style={{ color: "#dc2626", fontSize: 11 }}>{fieldState.error.message}</Text>
                      )}
                    </>
                  )}
                />
              </FormField>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 20 }}>
              <FormField>
                <FormFieldLabel>Symbol *</FormFieldLabel>
                <Controller
                  name="symbol"
                  control={control}
                  rules={{ required: "Symbol is required" }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="e.g., $" />
                      {fieldState.error && (
                        <Text style={{ color: "#dc2626", fontSize: 11 }}>{fieldState.error.message}</Text>
                      )}
                    </>
                  )}
                />
              </FormField>

              <FormField>
                <FormFieldLabel>Flag Emoji</FormFieldLabel>
                <Controller
                  name="flag"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g., " />
                  )}
                />
              </FormField>
            </div>

            {error && (
              <Text style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{error}</Text>
            )}
            {success && (
              <Text style={{ color: "#059669", fontSize: 13, marginTop: 8 }}>{success}</Text>
            )}

            <FlexLayout gap={1} style={{ marginTop: 20 }}>
              <Button
                appearance="bordered"
                type="button"
                onClick={() => { setShowForm(false); setError(""); setSuccess(""); reset() }}
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
                {isSubmitting ? "Adding..." : "Add Currency"}
              </Button>
            </FlexLayout>
          </form>
        </Card>
      )}

      {/* Currencies Table */}
      <Card style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {isLoading ? (
          <FlexLayout justify="center" style={{ padding: 60 }}>
            <Spinner />
          </FlexLayout>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 480 }}>
            <AgGridReact
              rowData={currencies}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={52}
              headerHeight={46}
              suppressMovableColumns
              suppressCellFocus
              getRowId={(params) => String(params.data.id)}
            />
          </div>
        )}
      </Card>
    </StackLayout>
  )
}