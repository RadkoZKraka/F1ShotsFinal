using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using F1Shots.Models;
using MongoDB.Bson;
using F1Shots.Services;
using F1Shots.Services.Requests;

namespace F1Shots.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var userProfile = await _userService.GetUserByIdAsync(userId);
            
            if (userProfile == null)
            {
                return NotFound("User profile not found.");
            }

            return Ok(new UserResponse
            {
                Id = userProfile.Id.ToString(),
                Email = userProfile.Email,
                Open = userProfile.Open,
                Username = userProfile.Username,
                Public = userProfile.Public
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var result = await _userService.UpdateUserProfileAsync(userId, request);

            if (result.IsAcknowledged && result.ModifiedCount == 1)
            {
                return Ok("Nothing to update.");
            }
            if (result.IsAcknowledged && result.ModifiedCount > 0)
            {
                return Ok("Profile updated");
            }

            if (!result.IsAcknowledged)
            {
                return BadRequest("Failed to update profile.");
            }

            return Ok("Profile updated successfully.");
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !ObjectId.TryParse(userIdString, out ObjectId userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var result = await _userService.ChangeUserPasswordAsync(userId, request.OldPassword, request.NewPassword);

            if (!result)
            {
                return BadRequest("Failed to change password. Please check the old password.");
            }

            return Ok("Password changed successfully.");
        }
        
        // New endpoint to get public profile by username
        [AllowAnonymous]  // Allow unauthenticated users to access this
        [HttpGet("profile/{username}")]
        public async Task<IActionResult> GetPublicProfileByUsername(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest("Username is required.");
            }

            var userProfile = await _userService.GetPublicUserByUsernameAsync(username);

            if (userProfile == null)
            {
                return NotFound("User profile not found.");
            }

            // Return only public profile fields if necessary
            return Ok(userProfile); // You can return only the public fields, if needed
        }
    }
}
