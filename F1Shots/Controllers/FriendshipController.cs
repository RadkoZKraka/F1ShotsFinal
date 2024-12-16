using System.Security.Claims;
using F1Shots.Models;
using F1Shots.Services;
using F1Shots.Services.Requests;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FriendshipController : ControllerBase
{
    private readonly UserRelationsService _userRelationsService;
    private readonly UserService _userService; // Assuming you have a UserService to handle user-related functionality
    private readonly CommonService _commonService;

    public FriendshipController(CommonService commonService, UserRelationsService userRelationsService,
        UserService userService)
    {
        _commonService = commonService;
        _userRelationsService = userRelationsService;
        _userService = userService;
    }

    // Send a friend request
    [HttpPost("add")]
    public async Task<IActionResult> AddFriend([FromBody] AddFriendRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var friendUser = await _userService.GetUserByUsernameAsync(request.FriendUsername);
        try
        {
            await _commonService.AddFriendAsync(userId, friendUser.Id);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }


        return Ok("Friend request sent.");
    }

    // Confirm a friendship
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmFriendRequest([FromBody] ConfirmFriendRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!ObjectId.TryParse(request.NotificationId, out ObjectId notificationId) ||
            !ObjectId.TryParse(request.FriendId, out ObjectId requestFriendId) ||
            !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return BadRequest("Invalid notificationId or userId.");
        }

        // Proceed with the logic to confirm the friend request
        var result = await _commonService.ConfirmFriendRequestAsync(userId, requestFriendId, notificationId);
        if (result)
        {
            return Ok("Friend request confirmed.");
        }

        return BadRequest("Failed to confirm the friend request.");
    }

    [HttpPost("reject")]
    public async Task<IActionResult> RejectFriendRequest([FromBody] RejectFriendRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!ObjectId.TryParse(request.NotificationId, out ObjectId notificationId) ||
            !ObjectId.TryParse(request.FriendId, out ObjectId requestFriendId) ||
            !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return BadRequest("Invalid notificationId or userId.");
        }

        // Proceed with the logic to confirm the friend request
        var result = await _commonService.RejectFriendRequestAsync(userId, requestFriendId, notificationId);
        if (result)
        {
            return Ok("Friend request rejected.");
        }

        return BadRequest("Failed to reject the friend request.");
    }

    // Confirm a friendship


    // Get all friends (confirmed or pending)
    [HttpGet("all")]
    public async Task<IActionResult> GetFriends()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var friends = await _userRelationsService.GetConfirmedFriendsAsUsersAsync(userId);
        return Ok(friends.Select(f => new { f.Id, f.Username, f.Email }));
    }

    // Get all users with public profiles
    [HttpGet("public-profiles")]
    public async Task<IActionResult> GetPublicProfiles()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        // Fetch users with public profiles
        var publicProfiles = await _userService.GetUsersWithPublicProfilesAsync(userId);

        // Return only relevant details like Id and Username
        return Ok(publicProfiles.Select(profile => new { profile.Id, profile.Username }));
    }

    [HttpGet("check-friend-request/{username}")]
    public async Task<IActionResult> CheckFriendRequestStatus(string username)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);


        // Get the user by username (the profile being visited)
        var visitingUser = await _userService.GetUserByUsernameAsync(username);

        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        if (userIdString == visitingUser.Id.ToString())
        {
            return Ok(3);
        }

        // Check if the current user has already sent a friend request to the visiting user
        var userRelation1 = await _userRelationsService.GetFriendshipByIdAsync(userId, visitingUser.Id);
        var userRelation2 = await _userRelationsService.GetFriendshipByIdAsync(visitingUser.Id, userId);


        if (userRelation1 == null && userRelation2 == null)
        {
            return Ok(0);
        }

        if (userRelation1 != null && userRelation1.Status == UserRelationStatus.Accepted)
        {
            return Ok(4);
        }

        if (userRelation2 != null && userRelation2.Status == UserRelationStatus.Accepted)
        {
            return Ok(4);
        }

        if (userRelation1 != null && userRelation1.Status == UserRelationStatus.Banned)
        {
            return Ok(5);
        }

        if (userRelation2 != null && userRelation2.Status == UserRelationStatus.Banned)
        {
            return Ok(5);
        }


        if (userRelation2 == null && userRelation1.Status == UserRelationStatus.Pending)
        {
            return Ok(2);
        }

        if (userRelation1 == null && userRelation2.Status == UserRelationStatus.Pending)
        {
            return Ok(1);
        }


        return Ok("No friend request exchanged.");
    }
}