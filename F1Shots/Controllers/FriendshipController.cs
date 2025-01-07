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
    
    [HttpPost("cancel-request/{friendUsername}")]
    public async Task<IActionResult> CancelRequest([FromRoute] string friendUsername)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var friendUser = await _userService.GetUserByUsernameAsync(friendUsername);
        try
        {
            await _commonService.CancelFriendRequestAsync(userId, friendUser.Id);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }


        return Ok("Friend request sent.");
    }

    // Confirm a friendship
    [HttpPost("confirm/{friendId}")]
    public async Task<IActionResult> ConfirmFriendRequest([FromRoute] string friendId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!ObjectId.TryParse(userIdString, out ObjectId userId) ||
            !ObjectId.TryParse(friendId, out ObjectId friendObjectId))
        {
            return BadRequest("Invalid friendId or userId.");
        }
        var userToConfirm = await _userService.GetUserByIdAsync(friendObjectId);

        // Proceed with the logic to confirm the friend request
        var result = await _commonService.ConfirmFriendRequestAsync(userId, userToConfirm.Id);
        if (result)
        {
            return Ok("Friend request confirmed.");
        }

        return BadRequest("Failed to confirm the friend request.");
    }

    [HttpPost("reject/{friendId}")]
    public async Task<IActionResult> RejectFriendRequest([FromRoute] string friendId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!ObjectId.TryParse(userIdString, out ObjectId userId) ||
            !ObjectId.TryParse(friendId, out ObjectId friendObjectId))
        {
            return BadRequest("Invalid friendId or userId.");
        }
        var userToReject = await _userService.GetUserByIdAsync(friendObjectId);

        // Proceed with the logic to confirm the friend request
        var result = await _commonService.RejectFriendRequestAsync(userId, userToReject.Id);
        if (result)
        {
            return Ok("Friend request rejected.");
        }

        return BadRequest("Failed to reject the friend request.");
    }

    [HttpPost("ban/{friendUsername}")]
    public async Task<IActionResult> BanUser([FromRoute] string friendUsername)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var friend = await _userService.GetUserByUsernameAsync(friendUsername);

        var userToBan = await _userService.GetUserByUsernameAsync(friendUsername);

        var relation = await _userRelationsService.GetFriendshipByIdAsync(userId, friend.Id);

        if (relation == null)
        {
            var banUser = new UserRelation
            {
                InitiationUserId = userId,
                RecipientUserId = userToBan.Id,
                Status = UserRelationStatus.Banned,
                CreatedAt = DateTime.UtcNow
            };

            await _userRelationsService.CreateRelation(banUser);
        }
        
        
        relation.InitiationUserId = userId;
        relation.RecipientUserId = userToBan.Id;
        relation.Status = UserRelationStatus.Banned;

        // Proceed with the logic to confirm the friend request
        await _userRelationsService.UpdateRelationStatus(relation);


        return Ok();
    }

    [HttpPost("unban/{friendUsername}")]
    public async Task<IActionResult> UnBanUser([FromRoute] string friendUsername)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var friend = await _userService.GetUserByUsernameAsync(friendUsername);

        var userToUnban = await _userService.GetUserByUsernameAsync(friendUsername);

        var relation = await _userRelationsService.GetFriendshipByIdAsync(userId, friend.Id);

        if (relation == null)
        {
            var banUser = new UserRelation
            {
                InitiationUserId = userId,
                RecipientUserId = userToUnban.Id,
                Status = UserRelationStatus.None,
                CreatedAt = DateTime.UtcNow
            };

            await _userRelationsService.CreateRelation(banUser);
        }

        relation.Status = UserRelationStatus.None;

        // Proceed with the logic to confirm the friend request
        await _userRelationsService.UpdateRelationStatus(relation);


        return Ok();
    }

    [HttpPost("delete-friend/{friendUsername}")]
    public async Task<IActionResult> DeleteFriend([FromRoute] string friendUsername)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }


        var friend = await _userService.GetUserByUsernameAsync(friendUsername);
        var relation = await _userRelationsService.GetFriendshipByIdAsync(userId, friend.Id);

        relation.Status = UserRelationStatus.None;

        // Proceed with the logic to confirm the friend request
        await _userRelationsService.UpdateRelationStatus(relation);


        return Ok();
    }


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
        return Ok(friends.Select(f => new { Id = f.Id.ToString(), f.Username, f.Email }));
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

        var publicProfiles = await _userService.GetUsersWithPublicProfilesAsync(userId);
        
        var validProfiles = await _commonService.GetValidProfilesAsync(userId, publicProfiles);

        return Ok(validProfiles.Select(profile => new { Id = profile.Id.ToString(), profile.Username }));
    }

    [HttpGet("check-friend-request/{username}")]
    public async Task<IActionResult> CheckFriendRequestStatus(string username)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);


        // Get the user by username (the profile being visited)
        var visitingUser = await _userService.GetUserByUsernameAsync(username);

        if (visitingUser == null)
        {
            return Ok(new
            {
                status = 7,
                notificationId =  ""
            });
        }

        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        if (userIdString == visitingUser.Id.ToString())
        {
            return Ok(new
            {
                status = 3,
                notificationId = ""
            });
        }

        // Check if the current user has already sent a friend request to the visiting user
        var userRelation = await _userRelationsService.GetFriendshipByIdAsync(userId, visitingUser.Id);

        var notification = await _commonService.GetFriendRequestNotificationAsync(userId, visitingUser.Id);

        if (userRelation == null)
        {
            return Ok(new
            {
                status = 0,
                notificationId = notification?.Id.ToString() ?? ""
            });
        }

        if (userRelation is { Status: UserRelationStatus.None or UserRelationStatus.Rejected })
        {
            return Ok(new
            {
                status = 0,
                notificationId = notification?.Id.ToString()
            });
        }

        if (userRelation is { Status: UserRelationStatus.Accepted })
        {
            return Ok(new
            {
                status = 4,
                notificationId = notification?.Id.ToString()
            });
        }


        if (userRelation is { Status: UserRelationStatus.Banned})
        {
            if (userRelation.InitiationUserId == userId)
            {
                return Ok(new
                {
                    status = 6,
                    notificationId = notification?.Id.ToString()
                });
            }
            if (userRelation.RecipientUserId == visitingUser.Id)
            {
                return Ok(new
                {
                    status = 5,
                    notificationId = notification?.Id.ToString()
                });
            }
        }


        if (userRelation is { Status: UserRelationStatus.Pending })
        {
            if (userRelation.InitiationUserId == userId)
            {
                return Ok(new
                {
                    status = 2,
                    notificationId = notification?.Id.ToString()
                });
            }
            if (userRelation.RecipientUserId == visitingUser.Id)
            {
                return Ok(new
                {
                    status = 1,
                    notificationId = notification?.Id.ToString()
                });
            }
        }


        return Ok("No friend request exchanged.");
    }

    [HttpGet("friends-invited/{groupId}")]
    public async Task<IActionResult> GetFriendsInvitedToGroup(string groupId)
    {
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        var friends = await _commonService.GetUsersInvitedToGroupAsync(groupObjectId);
        return Ok(friends.Select(f => new { Id = f.Id.ToString(), f.Username, f.Email }));
    }
    
    [HttpGet("banned-users")]
    public async Task<IActionResult> GetBannedUsers()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var bannedUsers = await _commonService.GetBannedUsersAsync(userId);
        return Ok(bannedUsers.Select(f => new { Id = f.Id.ToString(), f.Username}));
    }
}