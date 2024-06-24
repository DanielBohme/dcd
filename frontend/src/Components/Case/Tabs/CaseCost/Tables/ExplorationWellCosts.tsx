import React, { useEffect } from "react"
import { ITimeSeriesData } from "../../../../../Models/ITimeSeriesData"
import { useProjectContext } from "../../../../../Context/ProjectContext"
import { useCaseContext } from "../../../../../Context/CaseContext"
import CaseTabTable from "../../../Components/CaseTabTable"
import { updateObject } from "../../../../../Utils/common"
import { useModalContext } from "../../../../../Context/ModalContext"

interface ExplorationWellCostsProps {
    tableYears: [number, number]
    explorationWellsGridRef: React.MutableRefObject<any>
    alignedGridsRef: any[]
}

const ExplorationWellCosts: React.FC<ExplorationWellCostsProps> = ({
    tableYears,
    explorationWellsGridRef,
    alignedGridsRef,
}) => {
    const { project } = useProjectContext()
    const {
        exploration,
        setExploration,
    } = useModalContext()
    const {
        projectCase,
        activeTabCase,

        explorationWellCostProfile,
        setExplorationWellCostProfile,

        gAndGAdminCost,
        setGAndGAdminCost,

        seismicAcquisitionAndProcessing,
        setSeismicAcquisitionAndProcessing,

        sidetrackCostProfile,
        setSidetrackCostProfile,

        appraisalWellCostProfile,
        setAppraisalWellCostProfile,

        countryOfficeCost,
        setCountryOfficeCost,
    } = useCaseContext()

    const explorationTimeSeriesData: ITimeSeriesData[] = [
        {
            profileName: "G&G and admin",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: gAndGAdminCost,
            set: setGAndGAdminCost,
        },
        {
            profileName: "Seismic acquisition and processing",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: seismicAcquisitionAndProcessing,
            set: setSeismicAcquisitionAndProcessing,
        },
        {
            profileName: "Country office",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: countryOfficeCost,
            set: setCountryOfficeCost,
        },
        {
            profileName: "Exploration well",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: explorationWellCostProfile,
            set: setExplorationWellCostProfile,
        },
        {
            profileName: "Appraisal well",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: appraisalWellCostProfile,
            set: setAppraisalWellCostProfile,
        },
        {
            profileName: "Sidetrack well",
            unit: `${project?.currency === 1 ? "MNOK" : "MUSD"}`,
            profile: sidetrackCostProfile,
            set: setSidetrackCostProfile,
        },
    ]

    useEffect(() => {
        if (explorationWellsGridRef.current
            && explorationWellsGridRef.current.api
            && explorationWellsGridRef.current.api.refreshCells) {
            explorationWellsGridRef.current.api.refreshCells()
        }
    }, [gAndGAdminCost])

    useEffect(() => {
        if (exploration && explorationWellCostProfile && exploration.explorationWellCostProfile !== explorationWellCostProfile) {
            updateObject(exploration, setExploration, "explorationWellCostProfile", explorationWellCostProfile)
        }
    }, [exploration, explorationWellCostProfile])

    useEffect(() => {
        if (exploration && appraisalWellCostProfile && exploration.appraisalWellCostProfile !== appraisalWellCostProfile) {
            updateObject(exploration, setExploration, "appraisalWellCostProfile", appraisalWellCostProfile)
        }
    }, [exploration, appraisalWellCostProfile])

    useEffect(() => {
        if (exploration && sidetrackCostProfile && exploration.sidetrackCostProfile !== sidetrackCostProfile) {
            updateObject(exploration, setExploration, "sidetrackCostProfile", sidetrackCostProfile)
        }
    }, [exploration, sidetrackCostProfile])

    useEffect(() => {
        if (exploration && seismicAcquisitionAndProcessing && exploration.seismicAcquisitionAndProcessing !== seismicAcquisitionAndProcessing) {
            updateObject(exploration, setExploration, "seismicAcquisitionAndProcessing", seismicAcquisitionAndProcessing)
        }
    }, [exploration, seismicAcquisitionAndProcessing])

    useEffect(() => {
        if (exploration && countryOfficeCost && exploration.countryOfficeCost !== countryOfficeCost) {
            updateObject(exploration, setExploration, "countryOfficeCost", countryOfficeCost)
        }
    }, [exploration, countryOfficeCost])

    useEffect(() => {
        if (exploration && gAndGAdminCost && exploration.gAndGAdminCost !== gAndGAdminCost) {
            updateObject(exploration, setExploration, "gAndGAdminCost", gAndGAdminCost)
        }
    }, [exploration, gAndGAdminCost])

    useEffect(() => {
        if (activeTabCase === 5 && exploration) {
            setSeismicAcquisitionAndProcessing(exploration.seismicAcquisitionAndProcessing)
            setExplorationWellCostProfile(exploration.explorationWellCostProfile)
            setAppraisalWellCostProfile(exploration.appraisalWellCostProfile)
            setSidetrackCostProfile(exploration.sidetrackCostProfile)
            setCountryOfficeCost(exploration.countryOfficeCost)
            setGAndGAdminCost(exploration.gAndGAdminCost)
        }
    }, [activeTabCase])

    return (
        <CaseTabTable
            timeSeriesData={explorationTimeSeriesData}
            dg4Year={projectCase?.dG4Date ? new Date(projectCase?.dG4Date).getFullYear() : 2030}
            tableYears={tableYears}
            tableName="Exploration well cost"
            gridRef={explorationWellsGridRef}
            alignedGridsRef={alignedGridsRef}
            includeFooter
            totalRowName="Total"
        />
    )
}

export default ExplorationWellCosts
