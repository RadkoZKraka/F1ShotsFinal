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

    public async Task<Group> UpdateGroupAsync(Group group)
    {
        return await _groupStorage.UpdateGroupAsync(group);
    }

    public async Task<bool> CheckIfNameExistsAsync(string name)
    {
        return await _groupStorage.CheckIfNameExistsAsync(name);
    }

    public async Task DeleteGroupAsync(ObjectId groupObjectId)
    {
        await _groupStorage.DeleteGroupAsync(groupObjectId);
    }
    

    public async Task<Group> GetGroupByGroupnameAsync(string groupName)
    {
        return await _groupStorage.GetGroupByGroupnameAsync(groupName);
    }

    public async Task<List<Group>> GetPublicGroupsAsync()
    {
        return await _groupStorage.GetPublicGroupsAsync();
    }
}