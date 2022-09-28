/* eslint-disable camelcase */
import {
    Button,
    Icon,
    Menu,
    Tabs,
    Typography,
} from "@equinor/eds-core-react"
import {
    useEffect,
    useState,
} from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import {
    add, delete_to_trash, edit, library_add, more_vertical,
} from "@equinor/eds-icons"
import { useCurrentContext } from "@equinor/fusion"
import { Project } from "../models/Project"
import { Case } from "../models/case/Case"
import { GetProjectService } from "../Services/ProjectService"
import CaseAsset from "../Components/Case/CaseAsset"
import { unwrapCase, unwrapProjectId } from "../Utils/common"
import DefinitionView from "./DefinitionView"
import ExplorationViewTab from "./ExplorationViewTab"
import { EditCaseInputModal } from "./EditCaseInputModal"
import ReadOnlyCostProfile from "../Components/ReadOnlyCostProfile"
import { OpexCostProfile } from "../models/case/OpexCostProfile"
import { GetCaseService } from "../Services/CaseService"
import { StudyCostProfile } from "../models/case/StudyCostProfile"
import TimeSeries from "../Components/TimeSeries"
import { initializeFirstAndLastYear } from "./Asset/AssetHelper"
import { CaseCessationCostProfile } from "../models/case/CaseCessationCostProfile"
import ReadOnlyTimeSeries from "../Components/ReadOnlyTimeSeries"

const { Panel } = Tabs
const { List, Tab, Panels } = Tabs

const CaseViewDiv = styled.div`
    margin: 2rem;
    display: flex;
    flex-direction: column;
`

const TopWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 1.5rem 2rem;
`

const PageTitle = styled(Typography)`
    flex-grow: 1;
`

const InvisibleButton = styled(Button)`
    border: 1px solid #007079;
`

const TransparentButton = styled(Button)`
    color: #007079;
    background-color: white;
    border: 1px solid #007079;
`

const DividerLine = styled.div`
    background: gray;
    height: 0.05rem;
    width: 50rem;
    margin-bottom: 2rem;
    margin-top: 2rem;
`

const StyledTabPanel = styled(Panel)`
    padding-top: 0px;
    border-top: 1px solid LightGray;
`

function CaseView() {
    const [project, setProject] = useState<Project>()
    const [caseItem, setCase] = useState<Case>()
    const [activeTab, setActiveTab] = useState<number>(0)
    const { fusionContextId, caseId } = useParams<Record<string, string | undefined>>()
    const currentProject = useCurrentContext()
    const [opex, setOpex] = useState<OpexCostProfile>()
    const [study, setStudy] = useState<StudyCostProfile>()
    const [cessation, setCessation] = useState<CaseCessationCostProfile>()

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [editCaseModalIsOpen, setEditCaseModalIsOpen] = useState<boolean>(false)

    const [element, setElement] = useState<HTMLButtonElement>()

    const [hasChanges, setHasChanges] = useState(false)
    const [firstTSYear, setFirstTSYear] = useState<number>()
    const [lastTSYear, setLastTSYear] = useState<number>()

    const toggleEditCaseModal = () => setEditCaseModalIsOpen(!editCaseModalIsOpen)

    useEffect(() => {
        (async () => {
            try {
                const projectId = unwrapProjectId(currentProject?.externalId)
                const projectResult = await (await GetProjectService()).getProjectByID(projectId)
                setProject(projectResult)
                const caseResult = projectResult.cases.find((o) => o.id === caseId)
                setCase(caseResult)
            } catch (error) {
                console.error(`[CaseView] Error while fetching project ${currentProject?.externalId}`, error)
            }
        })()
    }, [currentProject?.externalId, caseId])

    useEffect(() => {
        (async () => {
            if (project !== undefined) {
                const caseResult = unwrapCase(project.cases.find((o) => o.id === caseId))
                setCase(caseResult)
                try {
                    const generatedOpexCost = await (await GetCaseService()).generateOpexCost(caseResult.id!)
                    setOpex(generatedOpexCost)
                } catch (error) {
                    console.error(`[CaseView] Error while fetching project ${currentProject?.externalId}`, error)
                }
                try {
                    const generateStudy = await (await GetCaseService()).generateStudyCost(caseResult.id!)
                    setStudy(generateStudy)
                } catch (error) {
                    console.error(`[CaseView] Error while fetching project ${currentProject?.externalId}`, error)
                }
                try {
                    const generateCessation = await (await GetCaseService()).generateCessationCost(caseResult.id!)
                    setCessation(generateCessation)
                } catch (error) {
                    console.error(`[CaseView] Error while fetching project ${currentProject?.externalId}`, error)
                }
                if (caseResult?.DG4Date) {
                    initializeFirstAndLastYear(
                        caseResult?.DG4Date?.getFullYear(),
                        [cessation,
                            opex,
                            study],
                        setFirstTSYear,
                        setLastTSYear,
                    )
                }
            }
        })()
    }, [project])

    useEffect(() => {
        if (caseItem?.DG4Date) {
            initializeFirstAndLastYear(
                caseItem?.DG4Date?.getFullYear(),
                [cessation,
                    opex,
                    study],
                setFirstTSYear,
                setLastTSYear,
            )
        }
        console.log(cessation)
        console.log(opex)
        console.log(study)
        console.log(firstTSYear)
        console.log(lastTSYear)
    }, [caseItem, cessation, opex, study])

    const onMoreClick = (target: any) => {
        setElement(target)
        setIsMenuOpen(!isMenuOpen)
    }

    if (!project) return null
    if (!caseItem) return null

    return (
        <div>
            <TopWrapper>
                <PageTitle variant="h2">{caseItem.name}</PageTitle>
                <TransparentButton
                    onClick={() => toggleEditCaseModal()}
                >
                    Edit Case input
                </TransparentButton>
                <InvisibleButton
                    onClick={(e) => onMoreClick(e.target)}
                >
                    <Icon data={more_vertical} />
                </InvisibleButton>
            </TopWrapper>
            <Menu
                id="menu-complex"
                open={isMenuOpen}
                anchorEl={element}
                onClose={() => setIsMenuOpen(false)}
                placement="bottom"
            >
                <Menu.Item
                    onClick={() => console.log("Add new case clicked")}
                >
                    <Icon data={add} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span">
                        Add New Case
                    </Typography>
                </Menu.Item>
                <Menu.Item
                    onClick={() => console.log("Duplicate clicked")}
                >
                    <Icon data={library_add} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span">
                        Duplicate
                    </Typography>
                </Menu.Item>
                <Menu.Item
                    onClick={() => console.log("Rename clicked")}
                >
                    <Icon data={edit} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span">
                        Rename
                    </Typography>
                </Menu.Item>
                <Menu.Item
                    onClick={() => console.log("Delete clicked")}
                >
                    <Icon data={delete_to_trash} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span">
                        Delete
                    </Typography>
                </Menu.Item>
            </Menu>
            <CaseViewDiv>
                <Tabs activeTab={activeTab} onChange={setActiveTab}>
                    <List>
                        <Tab>Definition </Tab>
                        <Tab>Schedule </Tab>
                        <Tab>Facilities </Tab>
                        <Tab>Exploration</Tab>
                        <Tab>Development </Tab>
                        <Tab>Production Profiles</Tab>
                        <Tab>Cost</Tab>
                        <Tab>CO2 Emissions </Tab>
                        <Tab>Summary </Tab>
                    </List>
                    <Panels>
                        <StyledTabPanel>
                            <DefinitionView
                                project={project}
                                setProject={setProject}
                                caseItem={caseItem}
                                setCase={setCase}
                            />
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Schedule</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Facilities</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            Exploration
                            <ExplorationViewTab
                                _case={caseItem}
                                _project={project}
                            />
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Development</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Production profiles</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Cost</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>CO2 Emissions</p>
                        </StyledTabPanel>
                        <StyledTabPanel>
                            <p>Summary</p>
                        </StyledTabPanel>
                    </Panels>
                </Tabs>
                <ReadOnlyCostProfile
                    dG4Year={caseItem.DG4Date?.getFullYear()}
                    timeSeries={cessation}
                    title="Cessation cost profile"
                />
                <ReadOnlyCostProfile
                    dG4Year={caseItem.DG4Date?.getFullYear()}
                    timeSeries={opex}
                    title="OPEX cost profile"
                />
                <ReadOnlyCostProfile
                    dG4Year={caseItem.DG4Date?.getFullYear()}
                    timeSeries={study}
                    title="Study cost profile"
                />
                {/* <TimeSeries
                    dG4Year={caseItem.DG4Date!.getFullYear()}
                    setTimeSeries={setCessation}
                    setHasChanges={setHasChanges}
                    timeSeries={[]}
                    firstYear={firstTSYear!}
                    lastYear={lastTSYear!}
                    profileName={[]}
                    profileEnum={project?.currency!}
                    profileType="Cost"
                    readOnlyTimeSeries={[cessation, opex, study]}
                    readOnlyName={["Cessation cost profile", "OPEX cost profile", "Study cost profile"]}
                /> */}
                <ReadOnlyTimeSeries
                    dG4Year={caseItem.DG4Date!.getFullYear()}
                    firstYear={firstTSYear!}
                    lastYear={lastTSYear!}
                    profileEnum={project?.currency!}
                    profileType="Cost"
                    readOnlyTimeSeries={[cessation, opex, study]}
                    readOnlyName={["Cessation cost profile", "OPEX cost profile", "Study cost profile"]}
                />
                <DividerLine />
                <CaseAsset
                    caseItem={caseItem}
                    project={project}
                    setProject={setProject}
                    setCase={setCase}
                    caseId={caseId}
                />

            </CaseViewDiv>
            <EditCaseInputModal
                toggleEditCaseModal={toggleEditCaseModal}
                caseItem={caseItem}
                isOpen={editCaseModalIsOpen}
                shards={[]}
            />
        </div>
    )
}

export default CaseView
