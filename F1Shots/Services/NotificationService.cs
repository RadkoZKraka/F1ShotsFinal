using MongoDB.Bson;
using F1Shots.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

public class NotificationService
{
    private readonly NotificationStorage _notificationStorage;

    public NotificationService(NotificationStorage notificationStorage)
    {
        _notificationStorage = notificationStorage;
    }

    // Create a new notification for a user
    public async Task<bool> CreateNotificationAsync(ObjectId userId, NotificationType type, string message)
    {
        try
        {
            // Create a new notification
            var notification = new Notification
            {
                UserIds = new List<ObjectId>{userId},
                Type = type,
                Message = message,
                Status = NotificationStatus.Unread,  // Assuming the notification starts as unread
                CreatedAt = DateTime.UtcNow
            };

            // Insert the notification into the storage
            await _notificationStorage.InsertNotificationAsync(notification);

            // Return true to indicate the notification was created successfully
            return true;
        }
        catch (Exception ex)
        {
            // Log the exception (you can use a logger here)
            Console.WriteLine($"Error creating notification: {ex.Message}");

            // Return false to indicate an error occurred
            return false;
        }
    }


    // Get all notifications for a user
    public async Task<List<Notification>> GetNotificationsAsync(ObjectId userId)
    {
        return await _notificationStorage.GetNotificationsByUserIdAsync(userId);
    }

    // Mark a notification as checked (read)
    public async Task MarkAsCheckedAsync(ObjectId notificationId)
    {
        await _notificationStorage.UpdateNotificationCheckedStatusAsync(notificationId, true);
    }

    // Get only unchecked notifications
    public async Task<List<Notification>> GetUncheckedNotificationsAsync(ObjectId userId)
    {
        return await _notificationStorage.GetUncheckedNotificationsByUserIdAsync(userId);
    }

    public async Task<List<Notification>> GetUnreadNotificationsByUserIdAsync(ObjectId userId)
    {
        return await _notificationStorage.GetUnreadNotificationsByUserIdAsync(userId);

    }
}