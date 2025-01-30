// GroupStorage.cs

using F1Shots.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

public class GroupStorage
{
    private readonly IMongoCollection<Group> _groups;

    public GroupStorage(IMongoDatabase database)
    {
        _groups = database.GetCollection<Group>("Groups");
    }

    // Method to get groups by user ID
    public async Task<List<Group>> GetGroupsByUserIdAsync(ObjectId userId)
    {
        var filter = Builders<Group>.Filter.AnyEq(g => g.PlayersIds, userId); // Assuming AdminUserIds is a list of user IDs
        var groups = await _groups.Find(filter).ToListAsync();
        return groups;
    }

    public async Task<List<Group>> GetPublicGroupsByUsername(string username)
    {
        // Define the filter to check if the PlayersIds list contains the provided username
        var filter = Builders<Group>.Filter.AnyEq(g => g.PlayersUserNames, username); 

        // Fetch the groups that match the filter
        var groups = await _groups.Find(filter).ToListAsync();

        // Return the list of groups
        return groups.Where(g => g.Public).ToList();
    }
    public async Task<Group> CreateGroupAsync(Group group)
    {
        try
        {
            await _groups.InsertOneAsync(group);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        var createdGroup = await GetGroupByIdAsync(group.Id);
        return createdGroup;
    }

    public async Task<Group> GetGroupByIdAsync(ObjectId groupId)
    {
        return await _groups.Find(g => g.Id == groupId).FirstOrDefaultAsync();
    }

    public async Task<bool> CheckIfGroupExists(string groupName)
    {
        return await _groups.Find(g => g.Name == groupName).AnyAsync();
    }

    public async Task<Group> UpdateGroupAsync(Group group)
    {
        var filter = Builders<Group>.Filter.Eq(g => g.Id, group.Id);
        var update = Builders<Group>.Update
            .Set(g => g.Name, group.Name)
            .Set(g => g.Public, group.Public)
            .Set(g => g.Open, group.Open)
            .Set(g => g.PlayersUserNames, group.PlayersUserNames)
            .Set(g => g.GroupPortfolioId, group.GroupPortfolioId)
            .Set(g => g.PlayersIds, group.PlayersIds)
            .Set(g => g.AdminUserIds, group.AdminUserIds);

        await _groups.UpdateOneAsync(filter, update);

        return group;
    }

    public async Task<bool> CheckIfNameExistsAsync(string name)
    {
        return await _groups.Find(g => g.Name == name).AnyAsync();
    }

    public async Task DeleteGroupAsync(ObjectId groupObjectId)
    {
        var result = await _groups.DeleteOneAsync(g => g.Id == groupObjectId);
        return;
    }


    public async Task<Group> GetGroupByGroupnameAsync(string groupName)
    {
        return await _groups.Find(g => g.Name == groupName).FirstOrDefaultAsync();
    }

    public async Task<List<Group>> GetPublicGroupsAsync()
    {
        var filter = Builders<Group>.Filter.Eq(g => g.Public, true);
        var groups = await _groups.Find(filter).ToListAsync();
        return groups;
    }
}