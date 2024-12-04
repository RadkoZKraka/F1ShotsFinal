using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using F1Shots.Data;
using F1Shots.Models;
using F1Shots.Services;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MongoDBService _mongoDBService;
    private readonly UserService _userService;
    private readonly IConfiguration _configuration;

    public AuthController(MongoDBService mongoDBService, UserService userService, IConfiguration configuration)
    {
        _mongoDBService = mongoDBService;
        _userService = userService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        // Check if user exists by email
        var user = _mongoDBService.GetUserProfilesAsync().Result
            .FirstOrDefault(u => u.Email == loginRequest.Email);

        if (user == null || !_userService.VerifyPassword(user, loginRequest.Password))
        {
            return Unauthorized("Invalid credentials");
        }

        // Generate JWT Token
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),  // Convert ObjectId to string
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return Ok(new { Token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
    {
        var existingUser = _mongoDBService.GetUserProfilesAsync().Result
            .FirstOrDefault(u => u.Email == registerRequest.Email);

        if (existingUser != null)
        {
            return Conflict("User already exists.");
        }

        // Hash the password
        var hashedPassword = _userService.HashPassword(registerRequest.Password);

        // Create new user profile
        var newUserProfile = new UserProfile
        {
            Username = registerRequest.Username,
            Email = registerRequest.Email,
            PasswordHash = hashedPassword
        };

        // Save user to MongoDB
        var collection = _mongoDBService.GetCollection<UserProfile>("UserProfiles");
        await collection.InsertOneAsync(newUserProfile);

        return Ok("User registered successfully.");
    }
}

// A simple login request model for capturing email and password
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}
public class RegisterRequest
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}