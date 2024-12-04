using Microsoft.AspNetCore.Mvc;

namespace F1Shots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommonController: ControllerBase
{
    [HttpGet]
    public ActionResult<string> Get()
    {
        return "Hello World!";
    }
}