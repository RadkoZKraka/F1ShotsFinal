using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using F1Shots.Models;
using F1Shots.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace F1Shots.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IConfiguration _configuration;

        public AuthController(UserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Regex to check if the identifier looks like an email
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            bool isEmail = Regex.IsMatch(loginRequest.Identifier, emailPattern);

            // Try to find the user by email or username based on the regex result
            var user = isEmail
                ? await _userService.GetUserByEmailAsync(loginRequest.Identifier)
                : await _userService.GetUserByUsernameAsync(loginRequest.Identifier);

            if (user == null || !_userService.VerifyPassword(user, loginRequest.Password))
            {
                return Unauthorized("Invalid credentials.");
            }

            // Generate JWT Token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Use user's ID
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
            // Check if the user already exists using UserService
            var existingUser = await _userService.GetUserByEmailAsync(registerRequest.Email);

            if (existingUser != null)
            {
                return Conflict("User already exists.");
            }

            // Hash the password using UserService
            var hashedPassword = _userService.HashPassword(registerRequest.Password);

            // Create a new user profile
            var newUserProfile = new UserProfile
            {
                Username = registerRequest.Username,
                Email = registerRequest.Email,
                PasswordHash = hashedPassword
            };

            // Save the new user using UserService
            await _userService.CreateUserAsync(newUserProfile);

            return Ok("User registered successfully.");
        }
        [HttpGet("check-username")]
        public async Task<IActionResult> CheckUsernameAvailability([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest("Username cannot be empty.");
            }

            // Check if the username already exists
            var exists = await _userService.CheckIfUsernameExistsAsync(username);
        


            return Ok(new { isTaken = exists });
        }
    }


    // A simple login request model for capturing email and password
// A simple login request model for capturing email/username and password
    public class LoginRequest
    {
        public string Identifier { get; set; } // This can be email or username
        public string Password { get; set; }
    }


    // A simple register request model for capturing username, email, and password
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}