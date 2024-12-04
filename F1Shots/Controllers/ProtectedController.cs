using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // This will require a valid JWT to access this endpoint
public class ProtectedController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProtectedData()
    {
        return Ok("This is protected data.");
    }
}