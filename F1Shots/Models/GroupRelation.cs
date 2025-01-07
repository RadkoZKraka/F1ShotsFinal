using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

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
    InvitePending,
    JoinPending,
    Accepted,
    InviteRejected,
    JoinRejected,
    Banned,
    GroupBanned,
    None
}
public enum GroupRelationRequest
{
    Sent,
    Received,
    None
}