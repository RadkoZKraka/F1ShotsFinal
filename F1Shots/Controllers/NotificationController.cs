// Controllers/NotificationController.cs

using System.Security.Claims;
using F1Shots.Services.Requests;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;
    private readonly UserService _userService;

    public NotificationController(NotificationService notificationService, UserService userService)
    {
        _notificationService = notificationService;
        _userService = userService;
    }

    // Endpoint to get notifications for the authenticated user
    [HttpGet("all")]
    public async Task<IActionResult> GetNotifications()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var notifications = await _notificationService.GetNotificationsAsync(userId);

        // Return a JSON object instead of a tuple
        return Ok(new
        {
            Notifications = notifications,
            NotificationIds = notifications.Select(n => n.Id.ToString()).ToList(),
            GroupIds = notifications.Select(n => n.GroupId.ToString()).ToList(),
            UserIds = notifications.Select(n => n.UserIds.Select(i => i.ToString())).ToList(),
            SenderUserIds = notifications.Select(n => n.SenderUserId.ToString()).ToList(),
        });
    }


    // Endpoint to get only unchecked notifications for the authenticated user
    [HttpGet("unread")]
    public async Task<IActionResult> GetUncheckedNotifications()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var notifications = await _notificationService.GetUnreadNotificationsByUserIdAsync(userId);

        var result = notifications.Select(n => new
        {
            NotificationId = n.Id.ToString(),
            GroupId = n.GroupId.ToString(),
            UserIds = n.UserIds.Select(i => i.ToString()).ToList(),
            SenderUserId = n.SenderUserId.ToString(),
            Status = n.Status,
            Type = n.Type,
            CreatedAt = n.CreatedAt,
            Message = n.Message
        }).ToList();

        return Ok(result);
    }

    [HttpGet("get-friend-request")]
    public async Task<IActionResult> GetFriendRequest([FromBody] FriendNotificationRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var user = await _userService.GetUserByIdAsync(userId);

        var notification =
            await _notificationService.GetFriendRequestByUsernames(request.FriendUsername, user.Username);


        return Ok(notification);
    }

    // Endpoint to mark a notification as checked
    [HttpPost("toggle-read/{notificationId}")]
    public async Task<IActionResult> ToggleRead([FromRoute] string notificationId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId) ||
            !ObjectId.TryParse(notificationId, out ObjectId notificationIdObj))
        {
            return Unauthorized("User not authenticated.");
        }

        await _notificationService.ToggleRead(notificationIdObj);
        return Ok("Notification marked as checked.");
    }

    // Endpoint to mark a notification as checked
    [HttpPost("mark-all-checked")]
    public async Task<IActionResult> MarkAllChecked([FromBody] MarkNotificationRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        await _notificationService.ToggleRead(request.NotificationId);
        return Ok("Notification marked as checked.");
    }
    [HttpDelete("{notificationId}")]
    public async Task<IActionResult> DeleteNotification([FromRoute] string notificationId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId) ||
            !ObjectId.TryParse(notificationId, out ObjectId notificationIdObj))
        {
            return Unauthorized("User not authenticated.");
        }

        await _notificationService.DeleteNotificationAsync(notificationIdObj);
        return Ok("Notification deleted.");
    }
}

public class FriendNotificationRequest
{
    public string FriendUsername { get; set; }
}