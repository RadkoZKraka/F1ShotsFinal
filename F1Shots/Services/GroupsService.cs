// GroupService.cs

using F1Shots.Models;
using MongoDB.Bson;

public class GroupService
{
    private readonly GroupStorage _groupStorage;

    public GroupService(GroupStorage groupStorage)
    {
        _groupStorage = groupStorage;
    }

    // Method to get groups by user ID
    public async Task<List<Group>> GetGroupsByUserIdAsync(ObjectId userId)
    {
        return await _groupStorage.GetGroupsByUserIdAsync(userId); // Fetch groups by user ID
    }
    public async Task<List<Group>> GetPublicGroupsByUsername(string userId)
    {
        return await _groupStorage.GetPublicGroupsByUsername(userId); // Fetch groups by user ID
    }

    public async Task<Group> CreateGroupAsync(Group group)
    {
        return await _groupStorage.CreateGroupAsync(group);
    }

    public async Task<Group> GetGroupByIdAsync(ObjectId groupId)
    {
        return await _groupStorage.GetGroupByIdAsync(groupId);

    }

    public async Task<bool> CheckIfGroupExists(string groupName)
    {
        return await _groupStorage.CheckIfGroupExists(groupName);

    }
}