// models/Notification.ts

export interface Notification {
    id: string; // MongoDB ObjectId as string (in frontend, it's usually represented as string)
    userIds: string[]; // The recipient of the notification (ObjectId as string)
    senderUserId: string; // The recipient of the notification (ObjectId as string)
    message: string; // The message content of the notification
    type: NotificationType; // Type of the notification (e.g., FriendRequest, Like, etc.)
    status: NotificationStatus; // Status of the notification (unread, read, etc.)
    createdAt: string; // Timestamp of when the notification was created
}

export enum NotificationStatus {
    Unread = 0,  // Notification has not been read yet
    Read = 1,      // Notification has been read
    Archived = 2, // Notification has been archived or dismissed
    Deleted = 3 // Notification has been deleted (can be used if you want to track deletions)
}

export enum NotificationType {
    FriendRequest = 0, // For friend requests
    GroupJoinRequest = 1, // For friend requests
    Comment = 2,             // For new comments
    Like = 3,                   // For likes on posts, comments, etc.
    Mention = 4             // For mentions in posts or comments
}
