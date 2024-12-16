using MongoDB.Bson;

namespace F1Shots.Services.Requests;

public class MarkNotificationRequest
{
    public ObjectId NotificationId { get; set; }
}