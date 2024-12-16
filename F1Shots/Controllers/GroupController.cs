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

    [HttpGet("{groupStringId}")]
    public async Task<IActionResult> GetGroup([FromRoute] string groupStringId )
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


        // Map groups to GroupResponse
        var groupResponse = new GroupResponse
        {
            Id = group.Id.ToString(),
            Name = group.Name,
            AdminUserIds = group.AdminUserIds.Select(adminId => adminId.ToString()).ToList(),
            PlayersIds = group.PlayersIds.Select(playerId => playerId.ToString()).ToList(),
            PlayersUserNames = group.PlayersUserNames,
            Years = group.Years,
            Public = group.Public
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
            Public = group.Public
        }).ToList();

        return Ok(groupResponses);
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
            Public = group.Public
        }).ToList();

        return Ok(groupResponses);
    }
}

public class CreateGroupRequest
{
    public string GroupName { get; set; }
    public bool Public { get; set; }
    public List<int> F1Years { get; set; }
}