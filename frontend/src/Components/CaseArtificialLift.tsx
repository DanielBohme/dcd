import {
    NativeSelect, Typography,
} from "@equinor/eds-core-react"
import {
    ChangeEvent, Dispatch, SetStateAction,
} from "react"
import styled from "styled-components"
import { Case } from "../models/Case"
import { Project } from "../models/Project"
import { GetCaseService } from "../Services/CaseService"
import { EMPTY_GUID } from "../Utils/constants"

const ArtificialLiftDropdown = styled(NativeSelect)`
width: 20rem;
padding-bottom: 2em;
`

interface Props {
    caseItem: Case | undefined,
    setArtificialLift: Dispatch<SetStateAction<Components.Schemas.ArtificialLift>>,
    setProject: Dispatch<SetStateAction<Project | undefined>>,
    currentValue: Components.Schemas.ArtificialLift,
}

const CaseArtificialLift = ({
    caseItem,
    setArtificialLift,
    setProject,
    currentValue,
}: Props) => {
    const onChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        let al:Components.Schemas.ArtificialLift
        switch (event.currentTarget.selectedOptions[0].value) {
        case "0":
            setArtificialLift(0)
            al = 0
            break
        case "1":
            setArtificialLift(1)
            al = 1
            break
        case "2":
            setArtificialLift(2)
            al = 2
            break
        case "3":
            setArtificialLift(3)
            al = 3
            break
        default:
            al = 0
            setArtificialLift(0)
            break
        }
        if (caseItem !== undefined) {
            const newCase = Case.Copy(caseItem)
            newCase.artificialLift = al
            const newProject = await GetCaseService().updateCase(newCase)
            setProject(newProject)
        }
    }

    const isDisabled = () => {
        if (caseItem?.drainageStrategyLink !== EMPTY_GUID
            || caseItem?.wellProjectLink !== EMPTY_GUID
            || caseItem?.surfLink !== EMPTY_GUID
            || caseItem?.topsideLink !== EMPTY_GUID) {
            return true
        }
        return false
    }
    return (
        <>
            {isDisabled()
                ? (
                    <Typography type="p" style={{ color: "red" }}>
                        Cannot change artificial lift while there are assets with artificial lift linked
                    </Typography>
                )
                : null}
            <ArtificialLiftDropdown
                label="Artificial lift"
                id="ArtificialLift"
                placeholder="Choose an artificial lift"
                onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event)}
                value={currentValue}
                disabled={isDisabled()}
            >
                <option key="0" value={0}>No lift</option>
                <option key="1" value={1}>Gas lift</option>
                <option key="2" value={2}>Electrical submerged pumps</option>
                <option key="3" value={3}>Subsea booster pumps</option>
            </ArtificialLiftDropdown>
        </>
    )
}

export default CaseArtificialLift
