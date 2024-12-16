// Controllers/NotificationController.cs

using System.Security.Claims;
using F1Shots.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using F1Shots.Services.Requests;
using MongoDB.Bson;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationController(NotificationService notificationService)
    {
        _notificationService = notificationService;
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
        return Ok(notifications);
    }

    // Endpoint to mark a notification as checked
    [HttpPost("mark-as-checked")]
    public async Task<IActionResult> MarkAsChecked([FromBody] MarkNotificationRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        await _notificationService.MarkAsCheckedAsync(request.NotificationId);
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

        await _notificationService.MarkAsCheckedAsync(request.NotificationId);
        return Ok("Notification marked as checked.");
    }
}