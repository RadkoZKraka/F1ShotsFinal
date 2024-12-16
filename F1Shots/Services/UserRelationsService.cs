// Services/FriendshipService.cs
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;
using F1Shots.Models;

public class UserRelationsService
{
    private readonly UserRelationsStorage _userRelationsStorage;
    private readonly NotificationService _notificationService;
    private readonly UserStorage _userStorage;

    public UserRelationsService(UserRelationsStorage userRelationsStorage, NotificationService notificationService, UserStorage userStorage)
    {
        _userRelationsStorage = userRelationsStorage;
        _notificationService = notificationService;
        _userStorage = userStorage;
    }

// Method to get confirmed friends
    public async Task<List<UserProfile>> GetConfirmedFriendsAsUsersAsync(ObjectId userId)
    {
        // Fetch confirmed friendships from FriendshipStorage
        var confirmedFriends = await _userRelationsStorage.GetConfirmedFriendsAsync(userId);

        List<UserProfile> friendsList = new List<UserProfile>();

        // Add confirmed friends to the list
        foreach (var friendship in confirmedFriends)
        {
            if (friendship.InitiationUserId == userId)
            {
                var friend = await _userStorage.GetUserByIdAsync(friendship.RecipientUserId);
                if (friend != null) friendsList.Add(friend);
            }
            else if (friendship.RecipientUserId == userId)
            {
                var friend = await _userStorage.GetUserByIdAsync(friendship.InitiationUserId);
                if (friend != null) friendsList.Add(friend);
            }
        }

        return friendsList;
    }

// Method to get users with public profiles
    public async Task<List<UserProfile>> GetUsersWithPublicProfilesAsync(ObjectId userId)
    {
        // Fetch users with public profiles from UserStorage
        var publicProfiles = await _userStorage.GetUsersWithPublicProfilesAsync(userId);

        return publicProfiles;
    }


    // Confirm a friendship: User1 confirms the request from User2
    // public async Task<bool> ConfirmFriendshipAsync(ObjectId user1Id, ObjectId user2Id)
    // {
    //     var result = await _friendshipStorage.ConfirmFriendshipAsync(user1Id, user2Id);
    //
    //     if (result)
    //     {
    //         // Create notification for both users about the confirmation
    //         await _notificationService.CreateNotificationAsync(user1Id, "friend_confirmation", $"You are now friends with {user2Id}.");
    //         await _notificationService.CreateNotificationAsync(user2Id, "friend_confirmation", $"You are now friends with {user1Id}.");
    //     }
    //
    //     return result;
    // }
    

    // Get confirmed friends
    public async Task<List<UserRelation>> GetConfirmedFriendsAsync(ObjectId userId)
    {
        return await _userRelationsStorage.GetConfirmedFriendsAsync(userId);
    }

    // Get pending friend requests
    public async Task<List<UserRelation>> GetPendingFriendsAsync(ObjectId userId)
    {
        return await _userRelationsStorage.GetPendingFriendsAsync(userId);
    }

    public async Task<bool> HasSentFriendRequestAsync(string userId, string visitingUserId)
    {
        throw new NotImplementedException();
    }

    public async Task<UserRelation> GetFriendshipByIdAsync(ObjectId userId, ObjectId visitingUserId)
    {
        return await _userRelationsStorage.GetFriendshipByIdAsync(userId, visitingUserId);
    }

}
