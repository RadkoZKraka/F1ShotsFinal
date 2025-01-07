// Storage/FriendshipStorage.cs

using System.Collections;
using F1Shots.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace F1Shots.Storage;

public class GroupRelationsStorage
{
    private readonly IMongoCollection<GroupRelation> _groupRelationsCollection;

    public GroupRelationsStorage(IMongoDatabase database)
    {
        _groupRelationsCollection = database.GetCollection<GroupRelation>("GroupRelations");
    }

    public async Task<List<GroupRelation>> GetGroupRelationsAsync(ObjectId userId)
    {
        var groupRelationsList = await _groupRelationsCollection.Find(
            f => f.UserToBeInvitedId == userId || f.GroupId == userId
        ).ToListAsync();
        return groupRelationsList;
    }

    public async Task<List<GroupRelation>> GetConfirmedGroupRelationsAsync(ObjectId userId)
    {
        var confirmedFriends = await _groupRelationsCollection.Find(
            f => ((f.UserToBeInvitedId == userId || f.GroupId == userId) && f.Status == GroupRelationStatus.Accepted)
        ).ToListAsync();

        return confirmedFriends;
    }

    public async Task<List<GroupRelation>> GetPendingGroupRelationsAsync(ObjectId userId)
    {
        var pendingGroupRelations = await _groupRelationsCollection.Find(
            f => (f.UserToBeInvitedId == userId || f.GroupId == userId) && f.Status != GroupRelationStatus.Accepted
        ).ToListAsync();
        return pendingGroupRelations;
    }

    public async Task<GroupRelation> GetGroupRelationByIdAsync(ObjectId userId, ObjectId groupId)
    {
        // Create a filter to match any relevant GroupRelation involving the given userId and groupId
        var filter = Builders<GroupRelation>.Filter.And(
            Builders<GroupRelation>.Filter.Or(
                Builders<GroupRelation>.Filter.Eq(f => f.UserToBeInvitedId, userId),
                Builders<GroupRelation>.Filter.Eq(f => f.UserRequestingJoinId, userId)
            ),
            Builders<GroupRelation>.Filter.Eq(f => f.GroupId, groupId)
        );

        // Retrieve the matching GroupRelation
        var groupRelation = await _groupRelationsCollection.Find(filter).FirstOrDefaultAsync();

        return groupRelation;
    }


    public async Task AddGroupRelationAsync(GroupRelation groupRelation)
    {
        await _groupRelationsCollection.InsertOneAsync(groupRelation);
    }

    public async Task UpdateGroupRelationAsync(GroupRelation groupRelation)
    {
        var update = Builders<GroupRelation>.Update
            .Set(f => f.Status, groupRelation.Status);

        await _groupRelationsCollection.UpdateOneAsync(
            f => f.Id == groupRelation.Id,
            update
        );
    }

    public async Task<List<GroupRelation>> GetGroupRelationsByGroupIdAsync(ObjectId groupObjectId)
    {
        var filter = Builders<GroupRelation>.Filter.And(
            Builders<GroupRelation>.Filter.Eq(gr => gr.GroupId, groupObjectId)
        );

        var groupRelations = await _groupRelationsCollection.Find(filter).ToListAsync();
        return groupRelations;
    }
    public async Task<List<GroupRelation>> GetGroupRelationsByGroupIdAndStatusAsync(ObjectId groupObjectId,
        GroupRelationStatus status)
    {
        var filter = Builders<GroupRelation>.Filter.And(
            Builders<GroupRelation>.Filter.Eq(gr => gr.GroupId, groupObjectId),
            Builders<GroupRelation>.Filter.Eq(gr => gr.Status, status)
        );

        var groupRelations = await _groupRelationsCollection.Find(filter).ToListAsync();
        return groupRelations;
    }

    public bool CheckIfUserIsInvitedToGroup(string userIdString, ObjectId groupId)
    {
        if (!ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return false;
        }

        var filter = Builders<GroupRelation>.Filter.And(
            Builders<GroupRelation>.Filter.Eq(gr => gr.UserToBeInvitedId, userId),
            Builders<GroupRelation>.Filter.Eq(gr => gr.GroupId, groupId),
            Builders<GroupRelation>.Filter.Eq(gr => gr.Status, GroupRelationStatus.InvitePending)
        );

        var groupRelation = _groupRelationsCollection.Find(filter).FirstOrDefault();
        return groupRelation != null;
    }

    public async Task<GroupRelation> GetGroupRelation(ObjectId userId, ObjectId groupId)
    {
        var groupRelation = await _groupRelationsCollection.Find(
            gr => gr.UserToBeInvitedId == userId && gr.GroupId == groupId
        ).FirstOrDefaultAsync();

        return groupRelation;
    }
}