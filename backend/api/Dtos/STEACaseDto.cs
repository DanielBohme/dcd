
namespace api.Dtos
{

    public class STEACaseDto
    {
        public string Name { get; set; } = null!;
        public int StartYear { get; set; }
        public ExplorationCostProfileDto Exploration { get; set; } = null!;

        public CapexDto Capex { get; set; } = null!;

        public ProductionAndSalesVolumesDto ProductionAndSalesVolumes { get; set; } = null!;
    }

    public class CapexDto : TimeSeriesCostDto
    {
        public WellProjectCostProfileDto Drilling { get; set; } = null!;

        public OffshoreFacilitiesCostProfileDto OffshoreFacilities { get; set; } = null!;
    }

    public class ProductionAndSalesVolumesDto
    {
        public int StartYear { get; set; }
        public int EndYear { get; set; }
        public ProductionProfileOilDto TotalAndAnnualOil { get; set; } = null!;
        public NetSalesGasDto TotalAndAnnualSalesGas { get; set; } = null!;
        public Co2EmissionsDto Co2Emissions { get; set; } = null!;
    }

    public class OffshoreFacilitiesCostProfileDto : TimeSeriesCostDto
    {

    }
}

