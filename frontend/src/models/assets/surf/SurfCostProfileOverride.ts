import { ITimeSeries } from "../../ITimeSeries"

export class SurfCostProfileOverride implements Components.Schemas.SurfCostProfileOverrideDto, ITimeSeries {
    id?: string
    startYear?: number
    name?: string
    values?: number []
    epaVersion?: string | null
    currency?: Components.Schemas.Currency | undefined
    sum?: number | undefined
    override?: boolean

    constructor(data?: Components.Schemas.SurfCostProfileOverrideDto) {
        if (data !== undefined && data !== null) {
            this.id = data.id
            this.startYear = data.startYear ?? 0
            this.name = "Cost profile"
            this.values = data.values ?? []
            this.epaVersion = data.epaVersion ?? ""
            this.currency = data.currency
            this.sum = data.sum
            this.override = data.override
        } else {
            this.id = "00000000-0000-0000-0000-000000000000"
            this.startYear = 0
            this.values = []
            this.name = "Cost profile"
            this.epaVersion = ""
        }
    }

    static fromJSON(data?: Components.Schemas.SurfCostProfileOverrideDto): SurfCostProfileOverride | undefined {
        if (data === undefined || data === null) {
            return undefined
        }
        return new SurfCostProfileOverride(data)
    }
}
