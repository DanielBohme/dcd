import { useEffect } from "react"
import { Tabs } from "@equinor/eds-core-react"
import Grid from "@mui/material/Grid"
import { useLocation } from "react-router-dom"
import styled from "styled-components"
import ProjectOverviewTab from "../Components/Project/ProjectOverviewTab"
import ProjectCompareCasesTab from "../Components/Project/CompareCasesTab/CompareCasesTabOverview"
import ProjectSettingsTab from "../Components/Project/ProjectSettingsTab"
import { useProjectContext } from "../Context/ProjectContext"

const {
    List, Tab, Panels, Panel,
} = Tabs

const ProjectView = () => {
    const { activeTabProject, setActiveTabProject } = useProjectContext()
    const location = useLocation()
    const activeTabProjectParam = location?.state?.activeTabProject

    useEffect(() => {
        if (activeTabProjectParam) { setActiveTabProject(activeTabProjectParam) }
    }, [activeTabProjectParam])

    return (
        <Grid container spacing={1} alignSelf="flex-start">
            <Grid item xs={12}>
                <Tabs activeTab={activeTabProject} onChange={setActiveTabProject}>
                    <List>
                        <Tab>Overview </Tab>
                        <Tab>Compare cases</Tab>
                        <Tab>Settings</Tab>
                    </List>
                    <Panels>
                        <Panel>
                            <ProjectOverviewTab />
                        </Panel>
                        <Panel>
                            <ProjectCompareCasesTab />
                        </Panel>
                        <Panel>
                            <ProjectSettingsTab />
                        </Panel>
                    </Panels>
                </Tabs>
            </Grid>
        </Grid>
    )
}

export default ProjectView
