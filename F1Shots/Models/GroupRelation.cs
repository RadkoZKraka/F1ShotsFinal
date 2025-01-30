using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models;

public class GroupRelation
{
    [BsonId] public ObjectId Id { get; set; }

    // User1 is the person who initiated the friend request
    public ObjectId UserToBeInvitedId { get; set; }
    public ObjectId UserRequestingJoinId { get; set; }

    // User2 is the recipient of the friend request
    public ObjectId GroupId { get; set; }

    // Indicates whether the friendship is confirmed
    public GroupRelationStatus Status { get; set; }

    // Timestamp for when the friend request was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum GroupRelationStatus
{
    InvitePending = 0,
    JoinPending = 1,
    Accepted = 2,
    InviteRejected = 3,
    JoinRejected = 4,
    Banned = 5,
    GroupBanned = 6,
    None = 7,
}
public enum GroupRelationRequest
{
    Sent,
    Received,
    None
}