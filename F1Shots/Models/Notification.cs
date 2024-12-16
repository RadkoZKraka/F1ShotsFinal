﻿// Models/Notification.cs

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

public class Notification
{
    public ObjectId Id { get; set; } // MongoDB ObjectId
    public List<ObjectId> UserIds { get; set; } // The recipient of the notification
    public ObjectId? SenderUserId { get; set; } // The recipient of the notification
    public string Message { get; set; } // The message content of the notification
    public NotificationType Type { get; set; } // Type of the notification (e.g., FriendRequest, Like, etc.)
    public NotificationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } // Timestamp of when the notification was created
}

public enum NotificationStatus
{
    Unread,   // Notification has not been read yet
    Read,     // Notification has been read
    Archived, // Notification has been archived or dismissed
    Deleted   // Notification has been deleted (can be used if you want to track deletions)
}


public enum NotificationType
{
    FriendRequest, // For friend requests
    GroupJoinRequest, // For friend requests
    Comment, // For new comments
    Like, // For likes on posts, comments, etc.
    Mention // For mentions in posts or comments
}