using api.Models;

namespace api.Repositories;

public interface IExplorationRepository : IBaseRepository
{
    Task<Exploration?> GetExploration(Guid explorationId);
    Exploration UpdateExploration(Exploration exploration);
    Task<ExplorationWell?> GetExplorationWell(Guid explorationId, Guid wellId);
    ExplorationWell UpdateExplorationWell(ExplorationWell explorationWell);
    Task<SeismicAcquisitionAndProcessing?> GetSeismicAcquisitionAndProcessing(Guid seismicAcquisitionAndProcessingId);
    SeismicAcquisitionAndProcessing UpdateSeismicAcquisitionAndProcessing(SeismicAcquisitionAndProcessing seismicAcquisitionAndProcessing);
    Task<CountryOfficeCost?> GetCountryOfficeCost(Guid countryOfficeCostId);
    CountryOfficeCost UpdateCountryOfficeCost(CountryOfficeCost countryOfficeCost);
}
