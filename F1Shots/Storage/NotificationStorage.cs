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
        return await _notificationCollection.Find(n => n.UserIds.Contains(userId)).ToListAsync();
    }

    // Get only unchecked notifications for a user
    public async Task<List<Notification>> GetUncheckedNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationCollection
            .Find(n => n.UserIds.Contains(userId) && n.Status != NotificationStatus.Read).ToListAsync();
    }

    // Mark a notification as checked
    public async Task UpdateNotificationCheckedStatusAsync(ObjectId notificationId, bool checkedStatus)
    {
        var update = Builders<Notification>.Update.Set(n => n.Status, NotificationStatus.Read);
        await _notificationCollection.UpdateOneAsync(n => n.Id == notificationId, update);
    }

    public async Task AddNotificationAsync(Notification notification)
    {
        // Insert the notification into the database
        await _notificationCollection.InsertOneAsync(notification);
    }

    public async Task<List<Notification>> GetUnreadNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationCollection
            .FindAsync(n => n.UserIds.Contains(userId) && n.Status != NotificationStatus.Read).Result.ToListAsync();
    }

    public async Task<Notification> GetNotificationById(ObjectId notificationId)
    {
        return await _notificationCollection.Find(n => n.Id == notificationId).FirstOrDefaultAsync();
    }

    public async Task UpdateNotificationAsync(Notification notification)
    {
        var update = Builders<Notification>.Update
            .Set(n => n.Status, notification.Status); // Set the status field to the new status

        await _notificationCollection.UpdateOneAsync(
            n => n.Id == notification.Id, // Filter to find the friendship by its ID
            update // Update definition
        );
    }
}