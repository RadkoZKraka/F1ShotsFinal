// Storage/FriendshipStorage.cs

using System.Collections;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;
using F1Shots.Models;

public class UserRelationsStorage
{
    private readonly IMongoCollection<UserRelation> _friendshipCollection;

    public UserRelationsStorage(IMongoDatabase database)
    {
        _friendshipCollection = database.GetCollection<UserRelation>("UserRelations");
    }

    // Confirm a friendship
    public async Task<List<UserRelation>> GetConfirmedAndPublicFriendsAsync(ObjectId userId)
    {
        return await _friendshipCollection
            .Find(f => (f.InitiationUserId == userId || f.RecipientUserId == userId) && f.Status == UserRelationStatus.Accepted)
            .ToListAsync();
    }


    // Get all friendships (confirmed and pending)
    public async Task<List<UserRelation>> GetFriendsAsync(ObjectId userId)
    {
        var friends = await _friendshipCollection.Find(
            f => f.InitiationUserId == userId || f.RecipientUserId == userId
        ).ToListAsync();
        return friends;
    }

    // Get confirmed friendships
    public async Task<List<UserRelation>> GetConfirmedFriendsAsync(ObjectId userId)
    {
        // Find friendships where either User1Id or User2Id is the given userId, and IsConfirmed is true
        var confirmedFriends = await _friendshipCollection.Find(
            f => ((f.InitiationUserId == userId || f.RecipientUserId == userId) && f.Status == UserRelationStatus.Accepted)
        ).ToListAsync();

        return confirmedFriends;
    }


    // Get pending friend requests
    public async Task<List<UserRelation>> GetPendingFriendsAsync(ObjectId userId)
    {
        var pendingFriends = await _friendshipCollection.Find(
            f => (f.InitiationUserId == userId || f.RecipientUserId == userId) && !(f.Status == UserRelationStatus.Accepted)
        ).ToListAsync();
        return pendingFriends;
    }

    public async Task<UserRelation> GetFriendshipByIdAsync(ObjectId userId, ObjectId friendId)
    {
        // Create filters to check both directions
        var filter = Builders<UserRelation>.Filter.Or(
            Builders<UserRelation>.Filter.And(
                Builders<UserRelation>.Filter.Eq(f => f.InitiationUserId, userId),
                Builders<UserRelation>.Filter.Eq(f => f.RecipientUserId, friendId)
            ),
            Builders<UserRelation>.Filter.And(
                Builders<UserRelation>.Filter.Eq(f => f.InitiationUserId, friendId),
                Builders<UserRelation>.Filter.Eq(f => f.RecipientUserId, userId)
            )
        );

        // Find the friendship in either direction
        var friendship = await _friendshipCollection.Find(filter).FirstOrDefaultAsync();

        return friendship; // Return null if no friendship is found
    }



    public async Task AddFriendshipAsync(UserRelation userRelation)
    {
        // Insert the friendship record into the database
        await _friendshipCollection.InsertOneAsync(userRelation);
    }

    public async Task UpdateFriendshipAsync(UserRelation userRelation)
    {
        var update = Builders<UserRelation>.Update
            .Set(f => f.Status, userRelation.Status); // Set the status field to the new status

        await _friendshipCollection.UpdateOneAsync(
            f => f.Id == userRelation.Id, // Filter to find the friendship by its ID
            update // Update definition
        );

    }

    public async Task AddRelationAsync(UserRelation userRelation)
    {
        await _friendshipCollection.InsertOneAsync(userRelation);
    }

    public async Task<List<UserRelation>> GetBannedUsersAsync(ObjectId userId)
    {
        return await _friendshipCollection.Find(f => f.InitiationUserId == userId && f.Status == UserRelationStatus.Banned).ToListAsync();
    }

    public async Task<List<UserRelation>> GetUserRelationsByUserIdAndStatusAsync(ObjectId userId, UserRelationStatus status)
    {
        var filter = Builders<UserRelation>.Filter.And(
            Builders<UserRelation>.Filter.Eq(gr => gr.InitiationUserId, userId),
            Builders<UserRelation>.Filter.Eq(gr => gr.Status, status)
        );

        var userRelations = await _friendshipCollection.Find(filter).ToListAsync();
        return userRelations;
    }
}
