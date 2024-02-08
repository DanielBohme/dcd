using api.Dtos;
using api.Models;

namespace api.Services;

public interface IExplorationWellService
{
    Task<ProjectDto> CreateExplorationWell(ExplorationWellDto explorationWellDto);
    Task<ExplorationWellDto[]?> CreateMultipleExplorationWells(ExplorationWellDto[] explorationWellDtos);
    Task<ExplorationWell> GetExplorationWell(Guid wellId, Guid caseId);
    Task<ExplorationWellDto[]?> CopyExplorationWell(Guid sourceExplorationId, Guid targetExplorationId);
    Task<IEnumerable<ExplorationWell>> GetAll();
}