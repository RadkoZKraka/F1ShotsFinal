// Models/Friendship.cs

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models;

public class UserRelation
{
    [BsonId] public ObjectId Id { get; set; }

    // User1 is the person who initiated the friend request
    public ObjectId InitiationUserId { get; set; }

    // User2 is the recipient of the friend request
    public ObjectId RecipientUserId { get; set; }

    // Indicates whether the friendship is confirmed
    public UserRelationStatus Status { get; set; }

    // Timestamp for when the friend request was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRelationStatus
{
    Pending,
    Accepted,
    Rejected,
    Favourite,
    Banned
}