import { Typography } from "@equinor/eds-core-react"
import {
    Dispatch, SetStateAction, useEffect, useState,
} from "react"
import DataTable, { CellValue } from "./DataTable/DataTable"
import {
    buildGridData, buildZeroGridData,
} from "./DataTable/helpers"
import { ITimeSeries } from "../models/ITimeSeries"
import {
    ImportButton, WrapperColumn, WrapperTablePeriod,
} from "../Views/Asset/StyledAssetComponents"
import NumberInputTable from "./NumberInputTable"

interface Props {
    dG4Year: number
    setTimeSeries: Dispatch<SetStateAction<ITimeSeries | undefined>>,
    setHasChanges: Dispatch<SetStateAction<boolean>>,
    firstYear: number | undefined,
    lastYear: number | undefined,
    timeSeries: (ITimeSeries | undefined)[]
    profileName: string[]
    profileEnum: number
    profileType: string
    readOnlyTimeSeries: (ITimeSeries | undefined)[]
    readOnlyName: string[]
}

const TimeSeries = ({
    dG4Year,
    setTimeSeries,
    setHasChanges,
    timeSeries,
    firstYear,
    lastYear,
    profileName,
    profileEnum,
    profileType,
    readOnlyTimeSeries,
    readOnlyName,
}: Props) => {
    const [columns, setColumns] = useState<string[]>([""])
    const [gridData, setGridData] = useState<CellValue[][]>([[]])
    const [tableFirstYear, setTableFirstYear] = useState<number>(Number.MAX_SAFE_INTEGER)
    const [tableLastYear, setTableLastYear] = useState<number>(Number.MIN_SAFE_INTEGER)
    const [yearsBeforeStartYear, setYearsBeforeStartYear] = useState<boolean>(false)
    const [yearsAfterEndYear, setYearsAfterEndYear] = useState<boolean>(false)

    const combinedTimeseries: any = []
    const combinedEmptyTimeseries: any = []

    const isValidYear = (year: number | undefined) => year?.toString().length === 4

    const buildAlignedGrid = (updatedTimeSeries: ITimeSeries) => {
        if (timeSeries !== undefined) {
            if (timeSeries[0] !== undefined && updatedTimeSeries !== undefined) {
                for (let i = 0; i < timeSeries[i]?.values?.length!; i += 1) {
                    if (timeSeries[i] !== undefined) {
                        if (updatedTimeSeries !== undefined && timeSeries[i] !== undefined) {
                            const columnTitles: string[] = []
                            if (firstYear !== undefined && lastYear !== undefined) {
                                for (let j = tableFirstYear; j <= tableLastYear; j += 1) {
                                    columnTitles.push(j.toString())
                                }
                            }
                            setColumns(columnTitles)

                            const zeroesAtStart: Number[] = Array.from({
                                length: Number(timeSeries[i]?.startYear!)
                                    + Number(dG4Year) - Number(firstYear),
                            }, (() => 0))

                            const zeroesAtEnd: Number[] = Array.from({
                                length: Number(lastYear)
                                    - (Number(timeSeries[i]?.startYear!)
                                        + Number(dG4Year)
                                        + Number(timeSeries[i]?.values!.length!)),
                            }, (() => 0))

                            const assetZeroesStartGrid = buildZeroGridData(zeroesAtStart)
                            const assetZeroesEndGrid = buildZeroGridData(zeroesAtEnd)
                            const newGridData = buildGridData(timeSeries[i])

                            const alignedAssetGridData = new Array(newGridData[0])
                            combinedTimeseries.push(alignedAssetGridData)
                        }
                    }
                }
            }
            setGridData(combinedTimeseries)
        }
    }

    const createNewGridWithReadOnlyData = (j: any) => {
        if (tableFirstYear && tableLastYear && readOnlyTimeSeries !== undefined) {
            const colYears = []
            for (let c = tableFirstYear; c <= tableLastYear; c += 1) {
                colYears.push(c.toString())
            }
            setColumns(colYears)
            const newGridData = buildGridData(readOnlyTimeSeries[j])
            const alignedAssetGridData = new Array(newGridData[0])
            combinedEmptyTimeseries.push(alignedAssetGridData)
            console.log(combinedEmptyTimeseries)
            setGridData(combinedEmptyTimeseries)
            setHasChanges(true)
        }
    }

    useEffect(() => {
        buildAlignedGrid(combinedTimeseries!)

        if (timeSeries[0] === undefined && readOnlyTimeSeries.length !== 0) {
            for (let i = 0; i < readOnlyTimeSeries?.length; i += 1) {
                if (readOnlyTimeSeries[i] !== undefined && readOnlyTimeSeries[i]?.values?.length !== 0) {
                    createNewGridWithReadOnlyData(i)
                }
            }
        }

        if (gridData !== undefined && isValidYear(firstYear) && isValidYear(lastYear) && firstYear && lastYear
            && tableFirstYear === Number.MAX_SAFE_INTEGER && tableLastYear === Number.MIN_SAFE_INTEGER
            && (firstYear !== lastYear)) {
            setTableFirstYear(firstYear)
            setTableLastYear(lastYear - 1)
        }
    }, [timeSeries, lastYear, firstYear])

    const createEmptyGrid = (j: any) => {
        if (gridData !== undefined && isValidYear(firstYear) && isValidYear(lastYear)) {
            setTableFirstYear(firstYear!)
            setTableLastYear(lastYear! - 1)
        }
        const newTimeSeries: ITimeSeries = { ...timeSeries[j] }
        const colYears = []
        for (let c = tableFirstYear; c <= (tableLastYear ?? Number.MIN_SAFE_INTEGER); c += 1) {
            colYears.push(c.toString())
        }
        setColumns(colYears)

        newTimeSeries.name = profileName[j]
        newTimeSeries.startYear = Number(colYears[0]) - dG4Year
        newTimeSeries.values = []

        setTimeSeries(newTimeSeries)
        if (newTimeSeries !== undefined) {
            const newGridData = buildGridData(timeSeries[j])

            const alignedAssetGridData = new Array(newGridData)
            combinedTimeseries.push(alignedAssetGridData)
        }
        console.log(combinedEmptyTimeseries)
        setGridData(combinedEmptyTimeseries)
        setHasChanges(true)
    }

    const NewTableFirstYearSmallerThanProfileFirstYear = (j: any) => tableFirstYear
        < (Number(timeSeries[j]?.startYear!) + Number(dG4Year))
    const NewTableLastYearGreaterThanProfileLastYear = (colYears: any, newTimeSeries: ITimeSeries) => (tableLastYear)
        > (Number(colYears[0]) + Number(newTimeSeries.values!.length))
    const NewTableLastYearSmallerThanProfileLastYear = (j: any, colYears: any) => tableLastYear
        < (Number(colYears[0]) + Number(timeSeries[j]?.values!.length))
    const NewTableFirstYearGreaterThanProfileFirstYear = (j: any) => tableFirstYear
        > (Number(timeSeries[j]?.startYear!) + Number(dG4Year))

    const createNewGridWithData = (j: number) => {
        if (tableFirstYear && tableLastYear && timeSeries !== undefined) {
            const newTimeSeries: ITimeSeries = { ...timeSeries[j] }
            const colYears = []
            for (let c = tableFirstYear; c <= tableLastYear; c += 1) {
                colYears.push(c.toString())
            }
            setColumns(colYears)
            newTimeSeries.name = profileName[j]
            newTimeSeries.startYear = timeSeries[j]?.startYear

            console.log(columns)

            if (NewTableFirstYearSmallerThanProfileFirstYear(j)) {
                setYearsBeforeStartYear(true)
                // newTimeSeries.startYear = tableFirstYear - dG4Year
                // newTimeSeries.values = new Array(colYears.length - newTimeSeries.values!.length)
                //     .fill(null).concat(newTimeSeries.values) ?? []
            }

            if (NewTableLastYearGreaterThanProfileLastYear(colYears, newTimeSeries)) {
                setYearsAfterEndYear(true)
                // newTimeSeries.values = (newTimeSeries.values)
                //     ?.concat(new Array(colYears.length - Number(timeSeries[j]?.values?.length)).fill(null)) ?? []
            }

            if (NewTableLastYearSmallerThanProfileLastYear(j, colYears)) {
                const yearDifference = (Number(colYears[0]) + Number(timeSeries[j]?.values?.length) - 1) - tableLastYear
                newTimeSeries.values = timeSeries[j]?.values?.slice(0, -yearDifference) ?? []
            }

            if (NewTableFirstYearGreaterThanProfileFirstYear(j)) {
                newTimeSeries.startYear = tableFirstYear - dG4Year
                const yearDifference = tableFirstYear - (Number(timeSeries[j]?.startYear) + dG4Year)
                newTimeSeries.values = timeSeries[j]?.values?.slice(yearDifference) ?? []
            }
            setTimeSeries(newTimeSeries)
            if (newTimeSeries !== undefined) {
                const newGridData = buildGridData(newTimeSeries)
                const alignedAssetGridData = new Array(newGridData[0])
                combinedEmptyTimeseries.push(alignedAssetGridData)
            }
            setGridData(combinedEmptyTimeseries)
            setHasChanges(true)
        }
    }

    const addTimeSeries = () => {
        const colYears = []
        if (isValidYear(tableFirstYear) && isValidYear(tableLastYear)) {
            for (let j = tableFirstYear; j < tableLastYear; j += 1) {
                colYears.push(j.toString())
            }
            setColumns(colYears)

            console.log(timeSeries)
            if (timeSeries[0] === undefined) {
                for (let i = 0; i < timeSeries?.length!; i += 1) {
                    createEmptyGrid(i)
                }
            }
            if (timeSeries[0] !== undefined) {
                for (let i = 0; i < timeSeries?.length!; i += 1) {
                    createNewGridWithData(i)
                }
            }
        }
    }

    return (
        <>
            <WrapperTablePeriod>
                <NumberInputTable
                    value={isValidYear(tableFirstYear) ? tableFirstYear : 2020}
                    setValue={setTableFirstYear}
                    integer
                    label="Start year"
                />
                <Typography variant="h2">-</Typography>
                <NumberInputTable
                    value={isValidYear(tableLastYear) ? tableLastYear : 2030}
                    setValue={setTableLastYear}
                    integer
                    label="End year"
                />
                <ImportButton
                    onClick={addTimeSeries}
                >
                    Apply
                </ImportButton>
            </WrapperTablePeriod>
            <Typography variant="h2">{profileType}</Typography>

            <WrapperColumn>
                <DataTable
                    columns={columns}
                    gridData={gridData}
                    dG4Year={dG4Year.toString()}
                    profileName={profileName}
                    profileEnum={profileEnum}
                    setHasChanges={setHasChanges}
                    setTimeSeries={setTimeSeries}
                    timeSeries={timeSeries}
                    profileType={profileType}
                    readOnlyTimeSeries={readOnlyTimeSeries}
                    readOnlyName={readOnlyName}
                    yearsBeforeStartYear={yearsBeforeStartYear}
                    yearsAfterEndYear={yearsAfterEndYear}
                    tableFirstYear={tableFirstYear}
                    tableLastYear={tableLastYear}
                />
            </WrapperColumn>
        </>
    )
}

export default TimeSeries
