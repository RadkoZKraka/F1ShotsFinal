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
        var filter = Builders<Group>.Filter.AnyEq(g => g.AdminUserIds, userId); // Assuming AdminUserIds is a list of user IDs
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

        return group;
    }

    public async Task<Group> GetGroupByIdAsync(ObjectId groupId)
    {
        return await _groups.Find(g => g.Id == groupId).FirstOrDefaultAsync();
    }

    public async Task<bool> CheckIfGroupExists(string groupName)
    {
        return await _groups.Find(g => g.Name == groupName).AnyAsync();
    }
}