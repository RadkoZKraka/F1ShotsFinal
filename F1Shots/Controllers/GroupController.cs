// GroupController.cs

using System.Security.Claims;
using F1Shots.Models;
using F1Shots.Models.Responses;
using F1Shots.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupController : ControllerBase
{
    private readonly GroupService _groupService;
    private readonly UserService _userService;
    private readonly CommonService _commonService;
    private readonly GroupPortfolioService _groupPortfolioService;

    public GroupController(GroupService groupService, UserService userService, CommonService commonService, GroupPortfolioService groupPortfolioService)
    {
        _groupService = groupService;
        _userService = userService;
        _commonService = commonService;
        _groupPortfolioService = groupPortfolioService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateGroup([FromBody] GroupRequest request)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var user = await _userService.GetUserByIdAsync(userId);
        
        if (await _groupService.CheckIfGroupExists(request.Name))
        {
            return Conflict("Group name already exists.");
        }

        var group = new Group
        {
            Name = request.Name,
            AdminUserIds = new List<ObjectId> { user.Id }, // Add user as the admin
            PlayersIds = new List<ObjectId> { user.Id }, // Add user as the admin
            PlayersUserNames = new List<string> { user.Username }, // Add user as the admin
            Years = new List<int>(request.Year),
            Motorsport = request.Motorsport,
            Public = request.Public,
            Open = request.Open
        };

        var createdGroup = await _groupService.CreateGroupAsync(group);
        
        var groupPortfolio = new GroupPortfolio
        {
            GroupId = createdGroup.Id.ToString(),
            Races = await _groupPortfolioService.GetRacesInfo(request.Year), // Initially empty, will be populated as races are added
            Years = new List<int>(request.Year), // Copy the years from the request
            Standings = new List<MemberStanding>(), // Empty standings, will update as users participate
            ScoringRules = "default", // Use provided rules or default
            CreationDate = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        };

        var createdPortfolio = await _groupPortfolioService.CreateGroupPortfolioAsync(groupPortfolio);
        
        createdGroup.GroupPortfolioId = createdPortfolio.Id;
        
        await _groupService.UpdateGroupAsync(createdGroup);

        if (createdGroup == null)
        {
            return BadRequest("Failed to create group.");
        }

        return Ok(createdGroup);
    }
    
    
    
    [HttpPut("{groupId}")]
    public async Task<IActionResult> UpdateGroup([FromRoute] string groupId, [FromBody] UpdateGroupRequest request)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        // Try to parse the groupId
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        // Fetch the group by ID
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        // Check if the current user is an admin of the group
        if (!group.AdminUserIds.Contains(userId))
        {
            return Unauthorized("User is not an admin of the group.");
        }

        // Update group properties
        group.Name = request.Name;
        group.Public = request.Public;
        group.Open = request.Open;
        group.AdminUserIds = request.AdminUserIds.Select(adminId => ObjectId.Parse(adminId)).ToList(); // Update adminUserIds

        // Save the updated group
        var updatedGroup = await _groupService.UpdateGroupAsync(group);

        if (updatedGroup == null)
        {
            return BadRequest("Failed to update group.");
        }
        _commonService.UpdateGroupInNotificationsAsync(updatedGroup);

        // Return the updated group response
        return Ok(new GroupResponse
        {
            Id = updatedGroup.Id.ToString(),
            Name = updatedGroup.Name,
            AdminUserIds = updatedGroup.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = updatedGroup.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = updatedGroup.PlayersUserNames,
            Years = updatedGroup.Years,
            Public = updatedGroup.Public,
            Open = updatedGroup.Open
        });
    }


    [HttpGet("{groupStringId}")]
    public async Task<IActionResult> GetGroup([FromRoute] string groupStringId)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }

        ObjectId.TryParse(groupStringId, out ObjectId groupId);

        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (!group.PlayersIds.Contains(ObjectId.Parse(userIdString)))
        {
            if (!group.Public)
            {
                bool isUserInvited = _commonService.CheckIfUserIsInvitedToGroup(userIdString, group.Id);

                if (!isUserInvited)
                {
                    return Ok("unauthorized");
                }
            }
        }
        // Check if the group is public or if the user has been invited


        // Map group to GroupResponse
        var groupResponse = new GroupResponse
        {
            Id = group.Id.ToString(),
            Name = group.Name,
            AdminUserIds = group.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = group.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Public = group.Public,
            Open = group.Open
        };

        return Ok(groupResponse);
    }

    


    [HttpGet("mygroups")]
    public async Task<IActionResult> GetMyGroups()
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }

        if (ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
        }

        // Fetch the groups where the user is an admin or a member
        var groups = await _groupService.GetGroupsByUserIdAsync(userId);

        if (groups == null || groups.Count == 0)
        {
            return Ok("No groups found for the user.");
        }

        // Map groups to GroupResponse
        var groupResponses = groups.Select(group => new GroupResponse
        {
            Id = group.Id.ToString(),
            Name = group.Name,
            AdminUserIds = group.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = group.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Public = group.Public,
            Open = group.Open,
        }).ToList();

        return Ok(groupResponses);
    }

    [HttpDelete("{groupId}/players/{playerId}")]
    public async Task<IActionResult> DeleteUserFromGroup([FromRoute] string groupId, [FromRoute]string playerId)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }

        // Try to parse the groupId
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        // Fetch the group by ID
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        // Check if the current user is an admin of the group
        if (!group.AdminUserIds.Contains(ObjectId.Parse(userIdString)))
        {
            return Unauthorized("User is not an admin of the group.");
        }

        // Try to parse the playerId
        if (!ObjectId.TryParse(playerId, out ObjectId playerObjectId))
        {
            return BadRequest("Invalid player ID.");
        }

        // Check if the player is part of the group
        if (!group.PlayersIds.Contains(playerObjectId))
        {
            return NotFound("Player not found in the group.");
        }

        // Remove the player from the group
        await _commonService.RemovePlayerFromGroupAsync(groupObjectId, playerObjectId);

        return Ok();
    }
    [HttpDelete("{groupId}")]
    public async Task<IActionResult> DeleteGroup([FromRoute]string  groupId)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }

        // Try to parse the groupId
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        // Fetch the group by ID
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        // Check if the current user is an admin of the group
        if (!group.AdminUserIds.Contains(ObjectId.Parse(userIdString)))
        {
            return Unauthorized("User is not an admin of the group.");
        }

        // Delete the group
        await _groupService.DeleteGroupAsync(groupObjectId);

        return Ok();
    }

    [HttpGet("check-group-relation/{groupName}")]
    public async Task<IActionResult> CheckGroupRelation([FromRoute] string groupName)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }

        // Try to parse the groupId
        if (!ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return BadRequest("Invalid user ID.");
        }
        
        var group = await _groupService.GetGroupByGroupnameAsync(groupName);
        
        if (group == null )
        {
            return Ok(404);
        }
        
        if (group.PlayersIds.Contains(userId))
        {
            return Ok(2);
        }
        if (group.Open == false)
        {
            return Ok(404);
        }



        // Fetch the group by ID
        var groupRelation = await _commonService.GetGroupRelation(ObjectId.Parse(userIdString), group.Id);
        
        if (groupRelation == null)
        {
            return Ok(7);
        }
        
    

        return Ok(groupRelation);
    }
    
    [HttpGet("group-relations/{groupId}")]
    public async Task<IActionResult> GetGroupRelations([FromRoute] string groupId)
    {
        // Get the userId from the JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var group = await _groupService.GetGroupByIdAsync(ObjectId.Parse(groupId));
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        // Fetch the group by ID
        var groupRelations = await _commonService.GetGroupRelationsByGroupIdAsync(group.Id);
        
        if (groupRelations == null)
        {
            return Ok("No group relations found.");
        }

        return Ok(new 
        {
            GroupId = group.Id.ToString(),
            GroupRelations = groupRelations.Select(groupRelation => new 
            {
                Id = groupRelation.Id.ToString(),
                UserToBeInvitedId = groupRelation.UserToBeInvitedId.ToString(),
                UserRequestingJoinId = groupRelation.UserRequestingJoinId.ToString(),
                Status = groupRelation.Status,
            }).ToList()
        });
    }
    [HttpPost("check-relation-user/{username}/{groupId}")]
    public async Task<IActionResult> CheckRelationUser([FromRoute] string username, [FromRoute] string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User not authenticated.");
        }
        
        if (!ObjectId.TryParse(userIdString, out ObjectId userId) || !ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid user ID.");
        }
        
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        var user = await _userService.GetUserByUsernameAsync(username);
        if (user == null)
        {
            return Ok(405);
        }
        
        if (group == null )
        {
            return Ok(404);
        }
        
        if (group.PlayersIds.Contains(user.Id))
        {
            return Ok(2);
        }

        // Fetch the group by ID
        var groupRelation = await _commonService.GetGroupRelation(user.Id, group.Id);
        
        if (groupRelation == null)
        {
            return Ok(7);
        }
        
    

        return Ok(groupRelation.Status);
    }

    [HttpGet("public-group/{username}")]
    public async Task<IActionResult> GetPublicGroupsByUsername(string username)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        // Fetch public groups the user is part of
        var publicGroups = await _groupService.GetPublicGroupsByUsername(username);

        if (publicGroups == null || publicGroups.Count == 0)
        {
            return Ok("No public groups found for this user.");
        }

        // Map public groups to GroupResponse
        var groupResponses = publicGroups.Select(group => new GroupResponse
        {
            Id = group.Id.ToString(),
            Name = group.Name,
            AdminUserIds = group.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = group.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Public = group.Public,
            Open = group.Open,
        }).ToList();

        return Ok(groupResponses);
    }
    [HttpPost("invite-user")]
    public async Task<IActionResult> InviteUserToGroup([FromBody] InviteUserRequest request)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        ObjectId.TryParse(request.GroupId, out ObjectId groupId);

        var user = await _userService.GetUserByIdAsync(userId);

        // Check if the user is an admin of the group
        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (!group.AdminUserIds.Contains(user.Id))
        {
            return Unauthorized("User is not an admin of the group.");
        }

        // Check if the user to be invited exists
        var userToBeInvited = await _userService.GetUserByUsernameAsync(request.Username);
        if (userToBeInvited == null)
        {
            return NotFound("User to be invited not found.");
        }

        // Check if the user is already a member of the group
        if (group.PlayersIds.Contains(userToBeInvited.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        var updatedGroup = await _commonService.InviteUserToGroupAsync(group.Id, userToBeInvited.Id, user.Id);

        if (updatedGroup == null)
        {
            return BadRequest("Failed to invite user to the group.");
        }

        return Ok(updatedGroup);
    }
    [HttpPost("confirm-invite/{notificationGuid}")]
    public async Task<IActionResult> ConfirmInviteToGroup([FromRoute] Guid notificationGuid)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var notifications = await _commonService.GetNotificationsByGuidAsync(notificationGuid);
        var userToBeInvited = await _userService.GetUserByIdAsync(userId);


        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(notifications.First().GroupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userToBeInvited.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.ConfirmGroupInviteAsync(userToBeInvited.Id, group.Id, notifications.First().Guid);

        return Ok();
    }
    [HttpPost("reject-invite/{notificationGuid}")]
    public async Task<IActionResult> RejectInviteToGroup([FromRoute] Guid notificationGuid)
    {
        // Validate user using JWT token
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var notifications = await _commonService.GetNotificationsByGuidAsync(notificationGuid);
        var userInvited = await _userService.GetUserByIdAsync(userId);

        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(notifications.First().GroupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userInvited.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.RejectGroupInviteAsync(userInvited.Id, group.Id, notifications.First().Guid);

        return Ok();
    }
    
    [HttpPost("request-join-group/{groupIdOrName}")]
    public async Task<IActionResult> RequestJoinGroup([FromRoute] string groupIdOrName)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var user = await _userService.GetUserByIdAsync(userId);

        // Try to parse groupIdOrName as ObjectId (groupId)
        bool isGroupId = ObjectId.TryParse(groupIdOrName, out ObjectId groupId);
        var group = isGroupId 
            ? await _groupService.GetGroupByIdAsync(groupId) 
            : await _groupService.GetGroupByGroupnameAsync(groupIdOrName);

        if (group == null)
        {
            return NotFound("Group not found.");
        }

        // Check if the user is already a member of the group
        if (group.PlayersIds.Contains(user.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.RequestJoinGroupAsync(group.Id, user.Id);

        return Ok();
    }
    
    [HttpPost("confirm-join-group/{notificationGuid}")]
    public async Task<IActionResult> ConfirmJoinGroup([FromRoute] Guid notificationGuid)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var notifications = await _commonService.GetNotificationsByGuidAsync(notificationGuid);
        var userToBeConfirmed = await _userService.GetUserByIdAsync(notifications.First().SenderUserId);

        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(notifications.First().GroupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userToBeConfirmed.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.ConfirmGroupJoinRequestAsync(userId, userToBeConfirmed.Id, group.Id, notifications.First().Guid);

        return Ok();
    }
    [HttpPost("reject-join-group/{notificationGuid}")]
    public async Task<IActionResult> RejectJoinGroup([FromRoute] Guid notificationGuid)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var notifications = await _commonService.GetNotificationsByGuidAsync(notificationGuid);
        var userToBeRejected = await _userService.GetUserByIdAsync(notifications[0].SenderUserId);

        var groupId = notifications.First().GroupId;
        if (groupId == null)
        {
            return NotFound("Group not found.");
        }
        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return Ok("Group not found.");
        }
        if (group.PlayersIds.Contains(userToBeRejected.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.RejectGroupJoinRequestAsync(userId, userToBeRejected.Id, group.Id, notifications.First().Guid);

        return Ok();
    }
    [HttpGet("check-name")]
    public async Task<IActionResult> CheckNameExists([FromQuery] string name)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        try
        {
            var userExists = await _groupService.CheckIfNameExistsAsync(name);
        
            if (userExists)
            {
                return Ok(true); // Username exists
            }
        
            return Ok(false); // Username doesn't exist
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("ban-from-group/{groupId}/{username}")]
    public async Task<IActionResult> BanFromGroup([FromRoute]string groupId,[FromRoute] string username)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }
        var user = await _userService.GetUserByUsernameAsync(username);
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (user == null || group == null)
        {
            return NotFound("User or group not found.");
        }

        if (group.AdminUserIds.Contains(user.Id))
        {
            return Unauthorized("Cannot ban admin of the group.");
        }

        await _commonService.BanUserFromGroupAsync(user.Id, group.Id);

        return Ok();
    }
    [HttpPost("unban-from-group/{groupId}/{username}")]
    public async Task<IActionResult> UnbanFromGroup([FromRoute]string groupId,[FromRoute] string username)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }
        var user = await _userService.GetUserByUsernameAsync(username);
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (user == null || group == null)
        {
            return NotFound("User or group not found.");
        }

        await _commonService.UnbanUserFromGroupAsync(user.Id, group.Id);

        return Ok();
    }

    [HttpGet("banned-users/{groupId}")]
    public async Task<IActionResult> GetBannedUsers([FromRoute]string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        var bannedUsers = await _commonService.GetBannedUsersByGroupIdAsync(group.Id);

        return Ok(bannedUsers);
    }
    [HttpPost("cancel-group-invite/{notificationGuid}")]
    public async Task<IActionResult> CancelGroupRequest([FromRoute] Guid notificationGuid)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var notifications = await _commonService.GetNotificationsByGuidAsync(notificationGuid);
        

        var user = await _userService.GetUserByUsernameAsync(notifications.First().UserId.ToString());
        var group = await _groupService.GetGroupByIdAsync(notifications.First().GroupId);
        
        if (user == null || group == null)
        {
            return NotFound("User or group not found.");
        }

        await _commonService.CancelGroupRequestAsync(user.Id, group.Id);

        return Ok();
    }
    [HttpPost("cancel-group-invite/{groupId}/{friendId}")]
    public async Task<IActionResult> CancelGroupRequestByGroupIdAndFriendId([FromRoute] string groupId, [FromRoute] string friendId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId) || !ObjectId.TryParse(friendId, out ObjectId friendIdObjectId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }
        
        var user = await _userService.GetUserByIdAsync(friendIdObjectId);
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (user == null || group == null)
        {
            return NotFound("User or group not found.");
        }

        await _commonService.CancelGroupRequestAsync(user.Id, group.Id);

        return Ok();
    }
    [HttpPost("cancel-group-join-request/{groupId}")]
    public async Task<IActionResult> CancelGroupJoinRequest([FromRoute] string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        if (!ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return BadRequest("Invalid group ID.");
        }

        var user = await _userService.GetUserByIdAsync(userId);
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (user == null || group == null)
        {
            return NotFound("User or group not found.");
        }

        await _commonService.CancelGroupJoinRequestAsync(user.Id, group.Id);

        return Ok();
    }
    [HttpPost("ban-group/{name}")]
    public async Task<IActionResult> BanGroup([FromRoute] string name)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var group = await _groupService.GetGroupByGroupnameAsync(name);
        
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        await _commonService.BanGroupAsync(group.Id, userId);

        return Ok();
    }
    [HttpPost("leave-group/{groupId}")]
    public async Task<IActionResult> LeaveGroup([FromRoute] string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId) || !ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        await _commonService.LeaveGroupAsync(group.Id, userId);

        return Ok();
    }
    
    [HttpPost("unban-group/{groupId}")]
    public async Task<IActionResult> UnbanGroup([FromRoute] string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId) || !ObjectId.TryParse(groupId, out ObjectId groupObjectId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var group = await _groupService.GetGroupByIdAsync(groupObjectId);
        
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        await _commonService.UnbanGroupAsync(group.Id, userId);

        return Ok();
    }
    
    [HttpPost("banned-groups")]
    public async Task<IActionResult> GetBannedGroups()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var bannedGroups = await _commonService.GetBannedGroupsByUserIdAsync(userId);
        
        var result = bannedGroups.Select(group => new 
        {
            Id = group.Id.ToString(),
            group.Name,
            AdminUserIds = group.AdminUserIds.Select(uid => uid.ToString()),
            PlayersIds = group.PlayersIds.Select(uid => uid.ToString()),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Motorsport = group.Motorsport,
            group.Public,
            group.Open
        });

        return Ok(result);
    }
    [HttpGet("public-groups")]
    public async Task<IActionResult> GetPublicGroups()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        
        var publicGroups = await _groupService.GetPublicGroupsAsync();

        var publicGroupsResponse = publicGroups.Select(group => new GroupResponse
        {
            Id = group.Id.ToString(),
            Name = group.Name,
            AdminUserIds = group.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = group.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Public = group.Public,
            Open = group.Open,
        }).ToList();

        return Ok(publicGroupsResponse);
    }

    // [HttpGet("group-portfolio/{groupId}")]
    // public async Task<IActionResult> GetGroupPortfolio([FromRoute] string groupId)
    // {
    //     var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    //     if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
    //     {
    //         return Unauthorized("User not authenticated.");
    //     }
    //     
    //     var groupPortfolio = await _groupPortfolioService.GetGroupPortfolioAsync(groupId);
    //     
    //     return Ok(groupPortfolio);
    // }
}


public class InviteUserRequest
{
    public string Username { get; set; }
    public string GroupId { get; set; }
}


public class UpdateGroupRequest
{
    public string Name { get; set; }
    public bool Public { get; set; }
    public bool Open { get; set; }
    public List<string> AdminUserIds { get; set; }
}