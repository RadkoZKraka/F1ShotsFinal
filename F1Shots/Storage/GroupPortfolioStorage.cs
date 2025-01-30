using F1Shots.Models;
using MongoDB.Driver;

namespace F1Shots.Storage;

public class GroupPortfolioStorage
{
    private readonly IMongoCollection<GroupPortfolio> _groupPortfolios;

    public GroupPortfolioStorage(IMongoDatabase database)
    {
        _groupPortfolios = database.GetCollection<GroupPortfolio>("GroupPortfolios");
    }

    public async Task<GroupPortfolio> GetGroupPortfolioByGroupIdAsync(string groupId)
    {
        return await _groupPortfolios.Find(gp => gp.GroupId == groupId).FirstOrDefaultAsync();
    }
    public async Task<GroupPortfolio> GetGroupPortfolioByIdAsync(string groupPortfolioId)
    {
        return await _groupPortfolios.Find(gp => gp.Id == groupPortfolioId).FirstOrDefaultAsync();
    }

    public async Task<GroupPortfolio> CreateGroupPortfolioAsync(GroupPortfolio groupPortfolio)
    {
        try
        {
            await _groupPortfolios.InsertOneAsync(groupPortfolio);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        var createdGroup = await GetGroupPortfolioByIdAsync(groupPortfolio.Id);
        return createdGroup;
    }
}