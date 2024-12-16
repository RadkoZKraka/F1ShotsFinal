// Storage/FriendshipStorage.cs

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
            f => f.UserId == userId || f.GroupId == userId
        ).ToListAsync();
        return groupRelationsList;
    }

    public async Task<List<GroupRelation>> GetConfirmedGroupRelationsAsync(ObjectId userId)
    {
        var confirmedFriends = await _groupRelationsCollection.Find(
            f => ((f.UserId == userId || f.GroupId == userId) && f.Status == GroupRelationStatus.Accepted)
        ).ToListAsync();

        return confirmedFriends;
    }

    public async Task<List<GroupRelation>> GetPendingGroupRelationsAsync(ObjectId userId)
    {
        var pendingGroupRelations = await _groupRelationsCollection.Find(
            f => (f.UserId == userId || f.GroupId == userId) && f.Status != GroupRelationStatus.Accepted
        ).ToListAsync();
        return pendingGroupRelations;
    }

    public async Task<GroupRelation> GetGroupRelationByIdAsync(ObjectId userId, ObjectId groupId)
    {
        var filter = Builders<GroupRelation>.Filter.And(
            Builders<GroupRelation>.Filter.Eq(f => f.UserId, userId),
            Builders<GroupRelation>.Filter.Eq(f => f.GroupId, groupId)
        );

        var groupRelation = await _groupRelationsCollection.Find(filter).FirstOrDefaultAsync();
    
        if (groupRelation == null)
        {
            filter = Builders<GroupRelation>.Filter.And(
                Builders<GroupRelation>.Filter.Eq(f => f.UserId, groupId),
                Builders<GroupRelation>.Filter.Eq(f => f.GroupId, userId)
            );

            groupRelation = await _groupRelationsCollection.Find(filter).FirstOrDefaultAsync();
        }

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
}
