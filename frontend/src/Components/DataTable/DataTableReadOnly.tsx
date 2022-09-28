import {
    Dispatch,
    SetStateAction,
    useCallback, useEffect, useMemo, useRef,
} from "react"
import "react-datasheet/lib/react-datasheet.css"
import "./style.css"
import { AgGridReact } from "ag-grid-react"
import { useAgGridStyles } from "@equinor/fusion-react-ag-grid-addons"
import { CellValueChangedEvent, ColDef } from "ag-grid-community"
import { Icon } from "@equinor/eds-core-react"
import { lock } from "@equinor/eds-icons"
import { ITimeSeries } from "../../models/ITimeSeries"
import { buildGridData } from "./helpers"
import "ag-grid-enterprise"

export interface CellValue {
    value: number | string
    readOnly?: boolean
}
interface Props {
    columns: string[]
    dG4Year: string
    profileEnum: number
    profileType: string
    readOnlyTimeSeries: (ITimeSeries | undefined)[]
    readOnlyName: string[]
}

function DataTableReadOnly({
    columns,
    dG4Year,
    profileEnum,
    profileType,
    readOnlyTimeSeries,
    readOnlyName,
}: Props) {
    const topGrid = useRef<AgGridReact>(null)
    const bottomGrid = useRef<AgGridReact>(null)

    useAgGridStyles()

    enum CurrencyEnum {
        "MNOK" = 1,
        "MUSD" = 2
    }

    enum GSM3Enum {
        "GSm³/yr" = 0,
        "Bscf/yr" = 1
    }

    enum MSM3Enum {
        "MSm³/yr" = 0,
        "mill bbls/yr" = 1
    }

    const setUnit = (j: number) => {
        if (["CO2 emissions", "Production profile NGL"].includes(readOnlyName[j])) {
            return "MTPA"
        }
        if (["Net sales gas", "Fuel flaring and losses", "Production profile gas"].includes(readOnlyName[j])) {
            return GSM3Enum[profileEnum]
        }
        if (["Production profile oil", "Production profile water",
            "Production profile water injection"].includes(readOnlyName[j])) {
            return MSM3Enum[profileEnum]
        }
        return CurrencyEnum[profileEnum]
    }

    // const lockIcon = () => <Icon data={lock} color="green" />

    const generateTimeSeriesYears = (index: number, dg4: string) => {
        const years = []
        if (dg4) {
            const profileStartYear: number = Number(readOnlyTimeSeries[index]?.startYear) + Number(dG4Year)
            const maxYear: number = Number(readOnlyTimeSeries[index]?.values?.length) + profileStartYear

            for (let i = profileStartYear; i < maxYear; i += 1) {
                years.push(i.toString())
            }
        }
        return years
    }

    const rowDataToColumns = () => {
        const col = columns
        const readOnlyCombinedObjArr: object[] = []
        const readOnlyObjValSum: number[] = []

        const value: object[] = []

        if (readOnlyName.length >= 1 && readOnlyTimeSeries !== undefined && col.length !== 0 && dG4Year) {
            for (let i = 0; i < readOnlyName.length; i += 1) {
                const totalValue: number[] = []
                const readOnly = { Profile: readOnlyName[i], Unit: setUnit(i), Total: totalValue }
                if (readOnlyTimeSeries[i] !== undefined && dG4Year) {
                    readOnlyObjValSum.push((readOnlyTimeSeries[i]?.values ?? [])
                        .reduce((x: number, y: number) => x + y))
                    totalValue.push(readOnlyObjValSum[i])
                }
                console.log(col)

                const objValToNumbers: number[] = readOnlyTimeSeries[i]?.values ?? []
                const rowObj = generateTimeSeriesYears(i, dG4Year)
                    .reduce((obj: object, element: string, index: number) => (
                        { ...obj, [element]: objValToNumbers[index] }), {})
                readOnlyCombinedObjArr.push(rowObj)
                value.push({ ...readOnlyCombinedObjArr[i], ...readOnly })
            }
        }
        return value
    }

    const columnsArrayToColDef = () => {
        if (columns.length !== 0) {
            const col = columns
            const columnToColDef = []
            const columnPinned = [
                {
                    field: "Profile",
                    pinned: "left",
                    width: "autoWidth",
                    aggFunc: "",
                    // cellRenderer: <Icon data={lock} color="green" />,
                },
                {
                    field: "Unit", pinned: "left", width: "autoWidth", aggFunc: "",
                },
                {
                    field: "Total", pinned: "right", aggFunc: "sum", cellStyle: { fontWeight: "bold" },
                }]
            for (let i = 0; i < col.length; i += 1) {
                columnToColDef.push({ field: col[i], aggFunc: "sum" })
            }
            const columnWithProfile = columnToColDef.concat([...columnPinned])
            return columnWithProfile
        }
        return undefined
    }

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
        editable: true,
        flex: 1,
    }), [])

    const footerColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
        editable: false,
        flex: 1,
    }), [])

    useEffect(() => {
    }, [readOnlyTimeSeries, dG4Year])

    const columnTotalsData = () => {
        const footerGridData = {
            Profile: "Total cost",
            Unit: setUnit(0),
        }
        const totalValueArray: number[] = []
        const valueArray: number[][] = []
        if (readOnlyTimeSeries.length >= 1 && columns.length !== 0) {
            for (let i = 0; i < columns.length; i += 1) {
                if (readOnlyTimeSeries[i] !== undefined) {
                    valueArray.push(readOnlyTimeSeries[i]?.values ?? [])
                }
            }
            for (let k = 0; k < columns.length; k += 1) {
                totalValueArray.push(valueArray.reduce((prev, curr) => prev + curr[k], 0))
            }
        }
        const value = columns
            .reduce((obj: object, element: string, index: number) => (
                { ...obj, [element]: totalValueArray[index] }), {})
        const totalTotalCostArray = []
        if (readOnlyTimeSeries.length >= 1 && columns.length !== 0) {
            for (let j = 0; j < readOnlyTimeSeries.length; j += 1) {
                if (readOnlyTimeSeries[j] !== undefined) {
                    totalTotalCostArray.push((readOnlyTimeSeries[j]?.values ?? [])
                        .reduce((x: number, y: number) => x + y))
                }
            }
        }
        const sum = totalTotalCostArray.reduce((prev, curr) => prev + curr, 0)
        const totalTotalObj = { Total: Number(sum) }
        const combinedFooterRow = [{ ...value, ...footerGridData, ...totalTotalObj }]
        return combinedFooterRow
    }

    return (
        <div
            style={{ display: "flex", flexDirection: "column", height: 150 }}
            className="ag-theme-alpine"
        >
            <div style={{ flex: "1 1 auto" }}>
                <AgGridReact
                    ref={topGrid}
                    alignedGrids={bottomGrid.current ? [bottomGrid.current] : undefined}
                    rowData={rowDataToColumns()}
                    columnDefs={columnsArrayToColDef()}
                    defaultColDef={defaultColDef}
                    animateRows
                    domLayout="autoHeight"
                    enableCellChangeFlash
                    rowSelection="multiple"
                    enableRangeSelection
                    suppressCopySingleCellRanges
                    suppressMovableColumns
                    enableCharts
                />
            </div>
            {profileType === "Cost"
                && (
                    <div style={{ flex: "none", height: "60px" }}>
                        <AgGridReact
                            ref={bottomGrid}
                            alignedGrids={topGrid.current ? [topGrid.current] : undefined}
                            rowData={columnTotalsData()}
                            defaultColDef={footerColDef}
                            columnDefs={columnsArrayToColDef()}
                            headerHeight={0}
                            rowStyle={{ fontWeight: "bold" }}
                        />
                    </div>
                )}
        </div>
    )
}

export default DataTableReadOnly
