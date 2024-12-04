using F1Shots.Models;
using F1Shots.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace F1Shots.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserProfileController : ControllerBase
{
    private readonly MongoDBService _mongoDBService;

    public UserProfileController(MongoDBService mongoDBService)
    {
        _mongoDBService = mongoDBService;
    }


}