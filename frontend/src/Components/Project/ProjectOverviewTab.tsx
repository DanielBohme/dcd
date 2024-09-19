import {
    MouseEventHandler,
} from "react"
import {
    Button, Icon, Typography,
} from "@equinor/eds-core-react"
import { add, archive } from "@equinor/eds-icons"
import { MarkdownEditor, MarkdownViewer } from "@equinor/fusion-react-markdown"
import Grid from "@mui/material/Grid"
import { useQuery, useQueryClient } from "react-query"
import { useModuleCurrentContext } from "@equinor/fusion-framework-react-module-context"
import { getProjectPhaseName, getProjectCategoryName } from "../../Utils/common"
import { GetSTEAService } from "../../Services/STEAService"
import { useProjectContext } from "../../Context/ProjectContext"
import CasesTable from "../Case/OverviewCasesTable/CasesTable"
import { useModalContext } from "../../Context/ModalContext"
import { useAppContext } from "../../Context/AppContext"
import Gallery from "../Gallery/Gallery"

const ProjectOverviewTab = () => {
    const { editMode } = useAppContext()
    const queryClient = useQueryClient()
    const {
        project,
        projectEdited,
        setProjectEdited,
    } = useProjectContext()
    const { currentContext } = useModuleCurrentContext()

    const {
        addNewCase,
    } = useModalContext()

    const projectId = currentContext?.externalId || null

    const { data: apiData } = useQuery<Components.Schemas.ProjectWithAssetsDto | undefined>(
        ["apiData", projectId],
        () => queryClient.getQueryData(["apiData", projectId]),
        {
            enabled: !!projectId,
            initialData: () => queryClient.getQueryData(["apiData", projectId]),
        },
    )

    const projectData = apiData || null

    function handleDescriptionChange(value: string) {
        if (projectEdited) {
            const updatedProject = { ...projectEdited, description: value }
            setProjectEdited(updatedProject)
        }
    }

    const submitToSTEA: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault()

        if (projectData) {
            try {
                await (await GetSTEAService()).excelToSTEA(projectData)
            } catch (error) {
                console.error("[ProjectView] error while submitting form data", error)
            }
        }
    }

    if (!project) {
        return <div>Loading project data...</div>
    }

    return (
        <Grid container columnSpacing={2} rowSpacing={3}>
            <Gallery />
            <Grid item xs={12} container spacing={1} justifyContent="space-between">
                <Grid item>
                    <Typography group="input" variant="label">Project Phase</Typography>
                    <Typography aria-label="Project phase">
                        {getProjectPhaseName(projectData?.projectPhase)}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography group="input" variant="label">Project Category</Typography>
                    <Typography aria-label="Project category">
                        {getProjectCategoryName(projectData?.projectCategory)}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography group="input" variant="label">Country</Typography>
                    <Typography aria-label="Country">
                        {projectData?.country ?? "Not defined in Common Library"}
                    </Typography>
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{ marginBottom: editMode ? "32px" : 0 }}>
                <Typography group="input" variant="label">Description</Typography>
                {editMode
                    ? (
                        <MarkdownEditor
                            menuItems={["strong", "em", "bullet_list", "ordered_list", "blockquote", "h1", "h2", "h3", "paragraph"]}
                            onInput={(markdown) => {
                                // eslint-disable-next-line no-underscore-dangle
                                const value = (markdown as any).target._value
                                handleDescriptionChange(value)
                            }}
                        >
                            {projectEdited?.description !== undefined ? projectEdited.description : projectData?.description}
                        </MarkdownEditor>
                    )
                    : <MarkdownViewer value={projectData?.description} />}
            </Grid>
            <Grid item xs={12} container spacing={1} justifyContent="space-between">
                <Grid item>
                    <Typography variant="h3">Cases</Typography>
                </Grid>
                <Grid item>
                    <Button onClick={() => addNewCase()}>
                        <Icon data={add} size={24} />
                        Add new Case
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <CasesTable />
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={submitToSTEA}>
                        <Icon data={archive} size={18} />
                        Download input to STEA
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ProjectOverviewTab
