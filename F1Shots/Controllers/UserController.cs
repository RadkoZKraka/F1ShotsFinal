using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace F1Shots.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/{controller}")]
    public class UserController : ControllerBase
    {
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);

            return Ok(new
            {
                Username = username,
                Email = email,
                CreatedAt = DateTime.UtcNow // Replace with actual value from DB
            });
        }
    }
}