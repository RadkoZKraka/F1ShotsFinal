using System.Security.Claims;
using F1Shots.Models;
using F1Shots.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace F1Shots.Controllers;


[ApiController]
[Route("api/[controller]")]
public class GroupPortfolioController : ControllerBase
{
    private readonly GroupService _groupService;
    private readonly UserService _userService;
    private readonly CommonService _commonService;
    private readonly GroupPortfolioService _groupPortfolioService;

    public GroupPortfolioController(GroupService groupService, UserService userService, CommonService commonService, GroupPortfolioService groupPortfolioService)
    {
        _groupService = groupService;
        _userService = userService;
        _commonService = commonService;
        _groupPortfolioService = groupPortfolioService;
    }

    [HttpGet("{groupId}")]
    public async Task<IActionResult> GetGroupPortfolio([FromRoute] string groupId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized("User not authenticated.");
        }
        var groupPortfolio = await _groupPortfolioService.GetGroupPortfolioAsync(groupId);
        return Ok(groupPortfolio);
    }
    
}