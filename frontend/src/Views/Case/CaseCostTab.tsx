import {
    ChangeEventHandler, Dispatch, SetStateAction, useEffect, useRef, useState,
} from "react"
import styled from "styled-components"

import {
    Button, NativeSelect, Progress, Typography,
} from "@equinor/eds-core-react"
import { Project } from "../../models/Project"
import { Case } from "../../models/case/Case"
import CaseNumberInput from "../../Components/Case/CaseNumberInput"
import { DrainageStrategy } from "../../models/assets/drainagestrategy/DrainageStrategy"
import CaseTabTable from "./CaseTabTable"
import { SetTableYearsFromProfiles } from "./CaseTabTableHelper"
import { GetCaseService } from "../../Services/CaseService"
import { ITimeSeries } from "../../models/ITimeSeries"
import { StudyCostProfile } from "../../models/case/StudyCostProfile"
import { OpexCostProfile } from "../../models/case/OpexCostProfile"
import { CaseCessationCostProfile } from "../../models/case/CaseCessationCostProfile"
import { SeismicAcquisitionAndProcessing } from "../../models/assets/exploration/SeismicAcquisitionAndProcessing"
import { CountryOfficeCost } from "../../models/assets/exploration/CountryOfficeCost"
import { GAndGAdminCost } from "../../models/assets/exploration/GAndGAdminCost"
import { Exploration } from "../../models/assets/exploration/Exploration"
import { GetExplorationService } from "../../Services/ExplorationService"
import { Surf } from "../../models/assets/surf/Surf"
import { GetSurfService } from "../../Services/SurfService"
import { ExplorationCostProfile } from "../../models/assets/exploration/ExplorationCostProfile"
import { WellProjectCostProfile } from "../../models/assets/wellproject/WellProjectCostProfile"
import { WellProject } from "../../models/assets/wellproject/WellProject"
import { Substructure } from "../../models/assets/substructure/Substructure"
import { Topside } from "../../models/assets/topside/Topside"
import { Transport } from "../../models/assets/transport/Transport"
import { TopsideCostProfile } from "../../models/assets/topside/TopsideCostProfile"
import { SurfCostProfile } from "../../models/assets/surf/SurfCostProfile"
import { SubstructureCostProfile } from "../../models/assets/substructure/SubstructureCostProfile"
import { TransportCostProfile } from "../../models/assets/transport/TransportCostProfile"
import { GetTopsideService } from "../../Services/TopsideService"
import { GetSubstructureService } from "../../Services/SubstructureService"
import { GetTransportService } from "../../Services/TransportService"
import { GetWellProjectService } from "../../Services/WellProjectService"
import { GetGenerateProfileService } from "../../Services/GenerateProfileService"
import { GasProducerCostProfile } from "../../models/assets/wellproject/GasProducerCostProfile"
import { OilProducerCostProfile } from "../../models/assets/wellproject/OilProducerCostProfile"
import { GasInjectorCostProfile } from "../../models/assets/wellproject/GasInjectorCostProfile"
import { WaterInjectorCostProfile } from "../../models/assets/wellproject/WaterInjectorCostProfile"
import { ExplorationWellCostProfile } from "../../models/assets/exploration/ExplorationWellCostProfile"
import { AppraisalWellCostProfile } from "../../models/assets/exploration/AppraisalWellCostProfile"
import { SidetrackCostProfile } from "../../models/assets/exploration/SidetrackCostProfile"

const ColumnWrapper = styled.div`
    display: flex;
    flex-direction: column;
`
const RowWrapper = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 78px;
`
const TopWrapper = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    margin-bottom: 20px;
`
const PageTitle = styled(Typography)`
    flex-grow: 1;
`
const NativeSelectField = styled(NativeSelect)`
    width: 200px;
    padding-right: 20px;
`
const NumberInputField = styled.div`
    padding-right: 20px;
`

const TableYearWrapper = styled.div`
    align-items: flex-end;
    display: flex;
    flex-direction: row;
    align-content: right;
    margin-left: auto;
    margin-bottom: 20px;
`
const YearInputWrapper = styled.div`
    width: 80px;
    padding-right: 10px;
`
const YearDashWrapper = styled.div`
    padding-right: 5px;
`
const TableWrapper = styled.div`
    margin-bottom: 50px;
`

interface Props {
    project: Project,
    setProject: Dispatch<SetStateAction<Project | undefined>>,
    caseItem: Case,
    setCase: Dispatch<SetStateAction<Case | undefined>>,
    topside: Topside,
    setTopside: Dispatch<SetStateAction<Topside | undefined>>,
    surf: Surf,
    setSurf: Dispatch<SetStateAction<Surf | undefined>>,
    substructure: Substructure,
    setSubstructure: Dispatch<SetStateAction<Substructure | undefined>>,
    transport: Transport,
    setTransport: Dispatch<SetStateAction<Transport | undefined>>,
    exploration: Exploration,
    setExploration: Dispatch<SetStateAction<Exploration | undefined>>,
    wellProject: WellProject,
    setWellProject: Dispatch<SetStateAction<WellProject | undefined>>,
    drainageStrategy: DrainageStrategy
    activeTab: number
}

function CaseCostTab({
    project, setProject,
    caseItem, setCase,
    exploration, setExploration,
    wellProject, setWellProject,
    topside, setTopside,
    surf, setSurf,
    substructure, setSubstructure,
    transport, setTransport,
    drainageStrategy,
    activeTab,
}: Props) {
    // OPEX
    const [studyCost, setStudyCost] = useState<StudyCostProfile>()
    const [opexCost, setOpexCost] = useState<OpexCostProfile>()
    const [cessationCost, setCessationCost] = useState<CaseCessationCostProfile>()

    // CAPEX
    const [topsideCost, setTopsideCost] = useState<TopsideCostProfile>()
    const [surfCost, setSurfCost] = useState<SurfCostProfile>()
    const [substructureCost, setSubstructureCost] = useState<SubstructureCostProfile>()
    const [transportCost, setTransportCost] = useState<TransportCostProfile>()

    // Development
    // const [wellProjectCost, setWellProjectCost] = useState<WellProjectCostProfile>()
    const [wellProjectOilProducerCost, setWellProjectOilProducerCost] = useState<OilProducerCostProfile>()
    const [wellProjectGasProducerCost, setWellProjectGasProducerCost] = useState<GasProducerCostProfile>()
    const [wellProjectWaterInjectorCost, setWellProjectWaterInjectorCost] = useState<WaterInjectorCostProfile>()
    const [wellProjectGasInjectorCost, setWellProjectGasInjectorCost] = useState<GasInjectorCostProfile>()

    // Exploration
    // const [explorationCost, setExplorationCost] = useState<ExplorationCostProfile>()
    const [explorationWellCost, setExplorationWellCost] = useState<ExplorationWellCostProfile>()
    const [explorationAppraisalWellCost, setExplorationAppraisalWellCost] = useState<AppraisalWellCostProfile>()
    const [explorationSidetrackCost, setExplorationSidetrackCost] = useState<SidetrackCostProfile>()
    const [seismicAcqAndProcCost, setseismicAcqAndProcCost] = useState<SeismicAcquisitionAndProcessing>()
    const [countryOfficeCost, setCountryOfficeCost] = useState<CountryOfficeCost>()
    const [gAndGAdminCost, setGAndGAdminCost] = useState<GAndGAdminCost>()

    const [startYear, setStartYear] = useState<number>(2020)
    const [endYear, setEndYear] = useState<number>(2030)
    const [tableYears, setTableYears] = useState<[number, number]>([2020, 2030])

    const opexGridRef = useRef(null)
    const capexGridRef = useRef(null)
    const developmentWellsGridRef = useRef(null)
    const explorationWellsGridRef = useRef(null)

    const [isSaving, setIsSaving] = useState<boolean>()

    useEffect(() => {
        (async () => {
            try {
                if (activeTab === 5) {
                    // OPEX
                    const study = await (await GetGenerateProfileService()).generateStudyCost(caseItem.id)
                    setStudyCost(study)
                    const opex = await (await GetGenerateProfileService()).generateOpexCost(caseItem.id)
                    setOpexCost(opex)
                    const cessation = await (await GetGenerateProfileService()).generateCessationCost(caseItem.id)
                    setCessationCost(cessation)

                    // CAPEX
                    const topsideCostProfile = topside.costProfile
                    setTopsideCost(topsideCostProfile)
                    const surfCostProfile = surf.costProfile
                    setSurfCost(surfCostProfile)
                    const substructureCostProfile = substructure.costProfile
                    setSubstructureCost(substructureCostProfile)
                    const transportCostProfile = transport.costProfile
                    setTransportCost(transportCostProfile)

                    // Development
                    // const wellProjectCostProfile = wellProject.costProfile
                    // setWellProjectCost(wellProjectCostProfile)
                    const {
                        oilProducerCostProfile, gasProducerCostProfile,
                        waterInjectorCostProfile, gasInjectorCostProfile,
                    } = wellProject
                    setWellProjectOilProducerCost(oilProducerCostProfile)
                    setWellProjectGasProducerCost(gasProducerCostProfile)
                    setWellProjectWaterInjectorCost(waterInjectorCostProfile)
                    setWellProjectGasInjectorCost(gasInjectorCostProfile)

                    // Exploration
                    // const explorationCostProfile = exploration.costProfile
                    // setExplorationCost(explorationCostProfile)
                    const {
                        explorationWellCostProfile, appraisalWellCostProfile, sidetrackCostProfile,
                        seismicAcquisitionAndProcessing,
                    } = exploration
                    setExplorationWellCost(explorationWellCostProfile)
                    setExplorationAppraisalWellCost(appraisalWellCostProfile)
                    setExplorationSidetrackCost(sidetrackCostProfile)
                    setseismicAcqAndProcCost(seismicAcquisitionAndProcessing)
                    const countryOffice = exploration.countryOfficeCost
                    setCountryOfficeCost(countryOffice)
                    const gAndGAdmin = await (await GetGenerateProfileService()).generateGAndGAdminCost(caseItem.id)
                    setGAndGAdminCost(gAndGAdmin)

                    SetTableYearsFromProfiles([study, opex, cessation,
                        surfCostProfile, topsideCostProfile, substructureCostProfile, transportCostProfile,
                        oilProducerCostProfile, gasProducerCostProfile,
                        waterInjectorCostProfile, gasInjectorCostProfile,
                        explorationWellCostProfile, appraisalWellCostProfile, sidetrackCostProfile,
                        seismicAcquisitionAndProcessing, countryOffice, gAndGAdmin,
                    ], caseItem.DG4Date.getFullYear(), setStartYear, setEndYear, setTableYears)
                }
            } catch (error) {
                console.error("[CaseView] Error while generating cost profile", error)
            }
        })()
    }, [activeTab])

    const updatedAndSetSurf = (surfItem: Surf) => {
        const newSurf: Surf = { ...surfItem }
        newSurf.costProfile = surfCost
        setSurf(newSurf)
    }

    const handleCaseFeasibilityChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const newCase = Case.Copy(caseItem)
        const newCapexFactorFeasibilityStudies = Math.min(Math.max(Number(e.currentTarget.value), 0), 100)
        newCase.capexFactorFeasibilityStudies = newCapexFactorFeasibilityStudies / 100
        setCase(newCase)
    }

    const handleCaseFEEDChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const newCase = Case.Copy(caseItem)
        const newCapexFactorFEEDStudies = Math.min(Math.max(Number(e.currentTarget.value), 0), 100)
        newCase.capexFactorFEEDStudies = newCapexFactorFEEDStudies / 100
        setCase(newCase)
    }

    const handleSurfMaturityChange: ChangeEventHandler<HTMLSelectElement> = async (e) => {
        if ([0, 1, 2, 3].indexOf(Number(e.currentTarget.value)) !== -1) {
            // eslint-disable-next-line max-len
            const newMaturity: Components.Schemas.Maturity = Number(e.currentTarget.value) as Components.Schemas.Maturity
            const newSurf: Surf = { ...surf }
            newSurf.maturity = newMaturity
            updatedAndSetSurf(newSurf)
        }
    }

    const handleStartYearChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const newStartYear = Number(e.currentTarget.value)
        if (newStartYear < 2010) {
            setStartYear(2010)
            return
        }
        setStartYear(newStartYear)
    }

    const handleEndYearChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const newEndYear = Number(e.currentTarget.value)
        if (newEndYear > 2100) {
            setEndYear(2100)
            return
        }
        setEndYear(newEndYear)
    }

    interface ITimeSeriesData {
        profileName: string
        unit: string,
        set?: Dispatch<SetStateAction<ITimeSeries | undefined>>,
        profile: ITimeSeries | undefined
    }

    const opexTimeSeriesData: ITimeSeriesData[] = [
        {
            profileName: "Study cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: studyCost,
        },
        {
            profileName: "OPEX cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: opexCost,
        },
        {
            profileName: "Cessation cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: cessationCost,
        },
    ]

    const capexTimeSeriesData: ITimeSeriesData[] = [
        {
            profileName: "Subsea production system",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: surfCost,
            set: setSurfCost,
        },
        {
            profileName: "Topside",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: topsideCost,
            set: setTopsideCost,
        },
        {
            profileName: "Substructure",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: substructureCost,
            set: setSubstructureCost,
        },
        {
            profileName: "Transport system",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: transportCost,
            set: setTransportCost,
        },
    ]

    const developmentTimeSeriesData: ITimeSeriesData[] = [
        {
            profileName: "Oil producer cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: wellProjectOilProducerCost,
            set: setWellProjectOilProducerCost,
        },
        {
            profileName: "Gas producer cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: wellProjectGasProducerCost,
            set: setWellProjectGasProducerCost,
        },
        {
            profileName: "Water injector cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: wellProjectWaterInjectorCost,
            set: setWellProjectWaterInjectorCost,
        },
        {
            profileName: "Gas injector cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: wellProjectGasInjectorCost,
            set: setWellProjectGasInjectorCost,
        },
    ]

    const explorationTimeSeriesData: ITimeSeriesData[] = [
        {
            profileName: "G&G and admin costs",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: gAndGAdminCost,
        },
        {
            profileName: "Seismic acquisition and processing",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: seismicAcqAndProcCost,
            set: setseismicAcqAndProcCost,
        },
        {
            profileName: "Country office cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: countryOfficeCost,
            set: setCountryOfficeCost,
        },
        {
            profileName: "Exploration well cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: explorationWellCost,
            set: setExplorationWellCost,
        },
        {
            profileName: "Appraisal well cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: explorationAppraisalWellCost,
            set: setExplorationAppraisalWellCost,
        },
        {
            profileName: "Sidetrack well cost",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: explorationSidetrackCost,
            set: setExplorationSidetrackCost,
        },
    ]

    const handleTableYearsClick = () => {
        setTableYears([startYear, endYear])
    }

    useEffect(() => {
        const newSurf: Surf = { ...surf }
        if (newSurf.costProfile && !surfCost) { return }
        newSurf.costProfile = surfCost
        setSurf(newSurf)
    }, [surfCost])

    useEffect(() => {
        const newTopside: Topside = { ...topside }
        if (newTopside.costProfile && !topsideCost) { return }
        newTopside.costProfile = topsideCost
        setTopside(newTopside)
    }, [topsideCost])

    useEffect(() => {
        const newSubstructure: Substructure = { ...substructure }
        if (newSubstructure.costProfile && !substructureCost) { return }
        newSubstructure.costProfile = substructureCost
        setSubstructure(newSubstructure)
    }, [substructureCost])

    useEffect(() => {
        const newTransport: Transport = { ...transport }
        if (newTransport.costProfile && !transportCost) { return }
        newTransport.costProfile = transportCost
        setTransport(newTransport)
    }, [transportCost])

    useEffect(() => {
        const newWellProject: WellProject = { ...wellProject }
        if (newWellProject.oilProducerCostProfile && !wellProjectOilProducerCost) { return }
        newWellProject.oilProducerCostProfile = wellProjectOilProducerCost
        setWellProject(newWellProject)
    }, [wellProjectOilProducerCost])

    useEffect(() => {
        const newWellProject: WellProject = { ...wellProject }
        if (newWellProject.gasProducerCostProfile && !wellProjectGasProducerCost) { return }
        newWellProject.gasProducerCostProfile = wellProjectGasProducerCost
        setWellProject(newWellProject)
    }, [wellProjectGasProducerCost])

    useEffect(() => {
        const newWellProject: WellProject = { ...wellProject }
        if (newWellProject.waterInjectorCostProfile && !wellProjectWaterInjectorCost) { return }
        newWellProject.waterInjectorCostProfile = wellProjectWaterInjectorCost
        setWellProject(newWellProject)
    }, [wellProjectWaterInjectorCost])

    useEffect(() => {
        const newWellProject: WellProject = { ...wellProject }
        if (newWellProject.gasInjectorCostProfile && !wellProjectGasInjectorCost) { return }
        newWellProject.gasInjectorCostProfile = wellProjectGasInjectorCost
        setWellProject(newWellProject)
    }, [wellProjectGasInjectorCost])

    useEffect(() => {
        const newExploration: Exploration = { ...exploration }
        if (newExploration.explorationWellCostProfile && !explorationWellCost) { return }
        newExploration.explorationWellCostProfile = explorationWellCost
        setExploration(newExploration)
    }, [explorationWellCost])

    useEffect(() => {
        const newExploration: Exploration = { ...exploration }
        if (newExploration.appraisalWellCostProfile && !explorationAppraisalWellCost) { return }
        newExploration.appraisalWellCostProfile = explorationAppraisalWellCost
        setExploration(newExploration)
    }, [explorationAppraisalWellCost])

    useEffect(() => {
        const newExploration: Exploration = { ...exploration }
        if (newExploration.sidetrackCostProfile && !explorationSidetrackCost) { return }
        newExploration.sidetrackCostProfile = explorationSidetrackCost
        setExploration(newExploration)
    }, [explorationSidetrackCost])

    useEffect(() => {
        const newExploration: Exploration = { ...exploration }
        if (newExploration.seismicAcquisitionAndProcessing && !seismicAcqAndProcCost) { return }
        newExploration.seismicAcquisitionAndProcessing = seismicAcqAndProcCost
        setExploration(newExploration)
    }, [seismicAcqAndProcCost])

    useEffect(() => {
        const newExploration: Exploration = { ...exploration }
        if (newExploration.countryOfficeCost && !countryOfficeCost) { return }
        newExploration.countryOfficeCost = countryOfficeCost
        setExploration(newExploration)
    }, [countryOfficeCost])

    const handleSave = async () => {
        setIsSaving(true)
        const updatedSurfResult = await (await GetSurfService()).newUpdate(surf)
        setSurf(updatedSurfResult)
        const updatedTopsideResult = await (await GetTopsideService()).newUpdate(topside)
        setTopside(updatedTopsideResult)
        const updatedSubstructureResult = await (await GetSubstructureService()).newUpdate(substructure)
        setSubstructure(updatedSubstructureResult)
        const updatedTransportResult = await (await GetTransportService()).newUpdate(transport)
        setTransport(updatedTransportResult)
        const updatedWellProjectResult = await (await GetWellProjectService()).newUpdate(wellProject)
        setWellProject(updatedWellProjectResult)
        const updatedExplorationResult = await (await GetExplorationService()).newUpdate(exploration)
        setExploration(updatedExplorationResult)
        const updateedCaseResult = await (await GetCaseService()).update(caseItem)
        setCase(updateedCaseResult)
        setIsSaving(false)
    }

    if (activeTab !== 5) { return null }

    return (
        <>
            <TopWrapper>
                <PageTitle variant="h3">Cost</PageTitle>
                {!isSaving ? <Button onClick={handleSave}>Save</Button> : (
                    <Button>
                        <Progress.Dots />
                    </Button>
                )}
            </TopWrapper>
            <ColumnWrapper>
                <RowWrapper>
                    <NumberInputField>
                        <CaseNumberInput
                            onChange={handleCaseFeasibilityChange}
                            defaultValue={caseItem.capexFactorFeasibilityStudies * 100}
                            integer={false}
                            label="CAPEX factor feasibility studies"
                            unit="%"
                        />
                    </NumberInputField>
                    <NumberInputField>
                        <CaseNumberInput
                            onChange={handleCaseFEEDChange}
                            defaultValue={caseItem.capexFactorFEEDStudies * 100}
                            integer={false}
                            label="CAPEX factor FEED studies"
                            unit="%"
                        />
                    </NumberInputField>
                    <NativeSelectField
                        id="maturity"
                        label="Maturity"
                        onChange={handleSurfMaturityChange}
                        value={surf.maturity}
                    >
                        <option key="0" value={0}>A</option>
                        <option key="1" value={1}>B</option>
                        <option key="2" value={2}>C</option>
                        <option key="3" value={3}>D</option>
                    </NativeSelectField>
                </RowWrapper>
            </ColumnWrapper>
            <ColumnWrapper>
                <TableYearWrapper>
                    <NativeSelectField
                        id="currency"
                        label="Currency"
                        onChange={() => { }}
                        value={project.currency}
                        disabled
                    >
                        <option key="1" value={1}>MNOK</option>
                        <option key="2" value={2}>MUSD</option>
                    </NativeSelectField>
                    <YearInputWrapper>
                        <CaseNumberInput
                            onChange={handleStartYearChange}
                            defaultValue={startYear}
                            integer
                            label="Start year"
                        />
                    </YearInputWrapper>
                    <YearDashWrapper>
                        <Typography variant="h2">-</Typography>
                    </YearDashWrapper>
                    <YearInputWrapper>
                        <CaseNumberInput
                            onChange={handleEndYearChange}
                            defaultValue={endYear}
                            integer
                            label="End year"
                        />
                    </YearInputWrapper>
                    <Button
                        onClick={handleTableYearsClick}
                    >
                        Apply
                    </Button>
                </TableYearWrapper>
            </ColumnWrapper>
            <TableWrapper>
                <CaseTabTable
                    caseItem={caseItem}
                    project={project}
                    setCase={setCase}
                    setProject={setProject}
                    timeSeriesData={opexTimeSeriesData}
                    dg4Year={caseItem.DG4Date.getFullYear()}
                    tableYears={tableYears}
                    tableName="OPEX"
                    gridRef={opexGridRef}
                    alignedGridsRef={[capexGridRef, developmentWellsGridRef, explorationWellsGridRef]}
                />
            </TableWrapper>
            <TableWrapper>
                <CaseTabTable
                    caseItem={caseItem}
                    project={project}
                    setCase={setCase}
                    setProject={setProject}
                    timeSeriesData={capexTimeSeriesData}
                    dg4Year={caseItem.DG4Date.getFullYear()}
                    tableYears={tableYears}
                    tableName="CAPEX"
                    gridRef={capexGridRef}
                    alignedGridsRef={[opexGridRef, developmentWellsGridRef, explorationWellsGridRef]}
                />
            </TableWrapper>
            <TableWrapper>
                <CaseTabTable
                    caseItem={caseItem}
                    project={project}
                    setCase={setCase}
                    setProject={setProject}
                    timeSeriesData={developmentTimeSeriesData}
                    dg4Year={caseItem.DG4Date.getFullYear()}
                    tableYears={tableYears}
                    tableName="Development well costs"
                    gridRef={developmentWellsGridRef}
                    alignedGridsRef={[opexGridRef, capexGridRef, explorationWellsGridRef]}
                />
            </TableWrapper>
            <CaseTabTable
                caseItem={caseItem}
                project={project}
                setCase={setCase}
                setProject={setProject}
                timeSeriesData={explorationTimeSeriesData}
                dg4Year={caseItem.DG4Date.getFullYear()}
                tableYears={tableYears}
                tableName="Exploration well costs"
                gridRef={explorationWellsGridRef}
                alignedGridsRef={[opexGridRef, capexGridRef, developmentWellsGridRef]}
            />
        </>
    )
}

export default CaseCostTab
