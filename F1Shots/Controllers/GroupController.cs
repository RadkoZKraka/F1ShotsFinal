// GroupController.cs

using System.Security.Claims;
using F1Shots.Models;
using F1Shots.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

[ApiController]
[Route("api/[controller]")]
public class GroupController : ControllerBase
{
    private readonly GroupService _groupService;
    private readonly UserService _userService;
    private readonly CommonService _commonService;

    public GroupController(GroupService groupService, UserService userService, CommonService commonService)
    {
        _groupService = groupService;
        _userService = userService;
        _commonService = commonService;
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
            Years = request.Years,
            Motorsport = request.Motorsport,
            Public = request.Public,
            Open = request.Open
        };

        var createdGroup = await _groupService.CreateGroupAsync(group);

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
        if (group == null || group.Open == false || group.PlayersIds.Contains(userId))
        {
            return Ok(404);
        }

        // Fetch the group by ID
        var groupRelation = await _commonService.GetGroupRelation(ObjectId.Parse(userIdString), group.Id);
        
        if (groupRelation == null)
        {
            return Ok(405);
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

        // Try to parse the groupId
        if (!ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return BadRequest("Invalid user ID.");
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

    [HttpGet("public-group/{username}")]
    public async Task<IActionResult> GetPublicGroupsByUsername(string username)
    {
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
    [HttpPost("confirm-invite/{groupIdString}")]
    public async Task<IActionResult> ConfirmInviteToGroup([FromRoute] string groupIdString)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        ObjectId.TryParse(groupIdString, out ObjectId groupId);
        
        var notification = await _commonService.GetNotificationByGroupIdAndUserId(userId, groupId);
        var userToBeInvited = await _userService.GetUserByIdAsync(userId);


        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userToBeInvited.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.ConfirmGroupInviteAsync(userToBeInvited.Id, group.Id, notification.Id);

        return Ok();
    }
    [HttpPost("reject-invite/{groupIdString}")]
    public async Task<IActionResult> RejectInviteToGroup([FromRoute] string groupIdString)
    {
        // Validate user using JWT token
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        ObjectId.TryParse(groupIdString, out ObjectId groupId);
        
        var notification = await _commonService.GetNotificationByGroupIdAndUserId(userId, groupId);
        var userInvited = await _userService.GetUserByIdAsync(userId);

        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userInvited.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.RejectGroupInviteAsync(userInvited.Id, group.Id, notification.Id);

        return Ok();
    }
    
    [HttpPost("request-join-group/{groupName}")]
    public async Task<IActionResult> RequestJoinGroup([FromRoute] string groupName)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        var user = await _userService.GetUserByIdAsync(userId);

        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByGroupnameAsync(groupName);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(user.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.RequestJoinGroupAsync(group.Id, user.Id);

        return Ok();
    }
    [HttpPost("confirm-join-group/{groupIdString}")]
    public async Task<IActionResult> ConfirmJoinGroup([FromRoute] string groupIdString)
    {
        // Validate user using JWT token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        ObjectId.TryParse(groupIdString, out ObjectId groupId);
        
        var notification = await _commonService.GetNotificationByGroupIdAndUserId(userId, groupId);
        var userToBeConfirmed = await _userService.GetUserByIdAsync(notification.SenderUserId);

        // Check if the user is already a member of the group
        var group = await _groupService.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound("Group not found.");
        }

        if (group.PlayersIds.Contains(userToBeConfirmed.Id))
        {
            return Conflict("User is already a member of the group.");
        }

        // Add the user to the group
        await _commonService.ConfirmGroupJoinRequestAsync(userId, userToBeConfirmed.Id, group.Id, notification.Id);

        return Ok();
    }
    [HttpPost("reject-join-group/{groupIdString}")]
    public async Task<IActionResult> RejectJoinGroup([FromRoute] string groupIdString)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        ObjectId.TryParse(groupIdString, out ObjectId groupId);
        
        var notification = await _commonService.GetNotificationByGroupIdAndUserId(userId, groupId);
        var userToBeRejected = await _userService.GetUserByIdAsync(notification.SenderUserId);

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
        await _commonService.RejectGroupJoinRequestAsync(userId, userToBeRejected.Id, group.Id, notification.Id);

        return Ok();
    }
    [HttpGet("check-name")]
    public async Task<IActionResult> CheckNameExists([FromQuery] string name)
    {
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

}

public class GroupInviteResponseRequest
{
    public string Username { get; set; }
    public string NotificationId { get; set; }
    public string GroupId { get; set; }
}
public class GroupJoinResponseRequest
{
    public string Username { get; set; }
    public string NotificationId { get; set; }
    public string GroupId { get; set; }
}

public class InviteUserRequest
{
    public string Username { get; set; }
    public string GroupId { get; set; }
}

public class CreateGroupRequest
{
    public string GroupName { get; set; }
    public bool Public { get; set; }
    public List<int> F1Years { get; set; }
}

public class UpdateGroupRequest
{
    public string Name { get; set; }
    public bool Public { get; set; }
    public bool Open { get; set; }
    public List<string> AdminUserIds { get; set; }
}
