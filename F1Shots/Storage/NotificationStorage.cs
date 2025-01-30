using MongoDB.Driver;
using F1Shots.Models;
using MongoDB.Bson;
using System.Threading.Tasks;
using System.Collections.Generic;

public class NotificationStorage
{
    private readonly IMongoCollection<Notification> _notificationCollection;

    public NotificationStorage(IMongoDatabase database)
    {
        _notificationCollection = database.GetCollection<Notification>("Notifications");
    }

    // Insert a new notification
    public async Task InsertNotificationAsync(Notification notification)
    {
        await _notificationCollection.InsertOneAsync(notification);
    }

    // Get notifications for a user
    public async Task<List<Notification>> GetNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationCollection.Find(n => n.UserId == userId).ToListAsync();
    }

    // Get only unchecked notifications for a user
    public async Task<List<Notification>> GetUncheckedNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationCollection
            .Find(n => n.UserId == userId && n.Status != NotificationStatus.Read).ToListAsync();
    }

    // Mark a notification as checked
    public async Task ToggleNotificationCheckedStatusAsync(ObjectId notificationId)
    {
        var notificationStatus = _notificationCollection.Find(n => n.Id == notificationId).FirstOrDefault().Status;

        if (notificationStatus == NotificationStatus.Read)
        {
            var update1 = Builders<Notification>.Update.Set(n => n.Status, NotificationStatus.Unread);
            var result1 = await _notificationCollection.UpdateOneAsync(n => n.Id == notificationId, update1);
            return;
        }
        
        if (notificationStatus == NotificationStatus.Unread)
        {
            var update2 = Builders<Notification>.Update.Set(n => n.Status, NotificationStatus.Read);
            var result1 = await _notificationCollection.UpdateOneAsync(n => n.Id == notificationId, update2);
            return;
        }
        
        return;
    }

    public async Task AddNotificationAsync(Notification notification)
    {
        // Insert the notification into the database
        await _notificationCollection.InsertOneAsync(notification);
    }

    public async Task<List<Notification>> GetUnreadNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationCollection
            .FindAsync(n => n.UserId == userId && n.Status != NotificationStatus.Read).Result.ToListAsync();
    }

    public async Task<Notification> GetNotificationById(ObjectId notificationId)
    {
        return await _notificationCollection.Find(n => n.Id == notificationId).FirstOrDefaultAsync();
    }

    public async Task UpdateNotificationAsync(Notification notification)
    {
        var update = Builders<Notification>.Update
            .Set(n => n.Status, notification.Status)
            .Set(n => n.Responded, notification.Responded); // Set the status field to the new status

        var result = await _notificationCollection.UpdateOneAsync(
            n => n.Id == notification.Id, // Filter to find the friendship by its ID
            update // Update definition
        );
        return;
    }

    public async void UpdateGroupInNotificationsAsync(Group updatedGroup)
    {
        var update = Builders<Notification>.Update
            .Set(n => n.GroupId, updatedGroup.Id)
            .Set(n => n.Message, $"You have been invited to join {updatedGroup.Name}."); // Update the Group field

        // Find notifications with the updatedGroup.Id and update them
        var filter = Builders<Notification>.Filter.Eq(n => n.GroupId, updatedGroup.Id); 

        var result = await _notificationCollection.UpdateManyAsync(
            filter,  // Use the filter to find notifications with the matching group Id
            update   // Apply the update to those notifications
        );
        
        return;
    }
    
    public async void UpdateUsernameInNotificationsAsync(ObjectId userId, string updatedUsername)
    {
        var update = Builders<Notification>.Update
            .Set(n => n.Message, $"{updatedUsername} has sent you a friend request."); // Update the Group field

        // Find notifications with the updatedGroup.Id and update them
        var filter = Builders<Notification>.Filter.Eq(n => n.SenderUserId, userId); 

        var result = await _notificationCollection.UpdateManyAsync(
            filter,  // Use the filter to find notifications with the matching group Id
            update   // Apply the update to those notifications
        );
        
        return;
    }

    public async Task<Notification> GetFriendRequestByUsernames(string requestFriend1Username, string requestFriend2Username)
    {
        var notification = _notificationCollection.Find(n =>
            (n.SenderUserId == ObjectId.Parse(requestFriend1Username) && n.UserId == ObjectId.Parse(requestFriend2Username)) ||
            (n.SenderUserId == ObjectId.Parse(requestFriend2Username) && n.UserId == ObjectId.Parse(requestFriend1Username))
        ).ToList();

         return notification.FirstOrDefault();
    }

    public async Task<Notification> GetNotificationByGroupIdAndUserId(ObjectId userId, ObjectId groupId)
    {
        return await _notificationCollection.Find(n => n.UserId == userId && n.GroupId == groupId).FirstOrDefaultAsync();
    }

    public async Task DeleteNotificationAsync(ObjectId notificationId)
    {
        var result = await _notificationCollection.DeleteOneAsync(n => n.Id == notificationId);

        return;
    }

    public async Task<Notification> GetGroupInviteByGroupIdAndUserIdAsync(ObjectId groupId, ObjectId userInvitedId)
    {
        return await _notificationCollection.Find(n => n.GroupId == groupId && n.UserId == userInvitedId).FirstOrDefaultAsync();
    }
    public async Task<List<Notification>> GetGroupJoinRequestByGroupIdAndUserIdAsync(ObjectId groupId, ObjectId userRequestingToJoin)
    {
        return await _notificationCollection.Find(n => n.GroupId == groupId && n.SenderUserId == userRequestingToJoin).ToListAsync();
    }

    public async Task<List<Notification>> GetNotificationsByGuidAsync(Guid notificationGuid)
    {
        return await _notificationCollection.Find(n => n.Guid == notificationGuid).ToListAsync();
    }
}