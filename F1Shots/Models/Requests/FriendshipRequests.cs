using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;

namespace F1Shots.Services.Requests;

public class ConfirmFriendshipRequest
{
    [Required] public ObjectId FriendId { get; set; }

}

public class AddFriendRequest
{
    [Required] public String FriendUsername { get; set; }
    
}

public class ConfirmFriendRequest
{
    [Required]
    public String FriendId { get; set; }

    [Required]
    public String NotificationId { get; set; } // Added NotificationId
}

public class RejectFriendRequest
{
    [Required]
    public String FriendId { get; set; }

    [Required]
    public String NotificationId { get; set; } // Added NotificationId
}
