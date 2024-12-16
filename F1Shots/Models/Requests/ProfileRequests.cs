namespace F1Shots.Services.Requests;

public class UpdateProfileRequest
{
    public string Username { get; set; }
    public string Email { get; set; }
    public bool Public { get; set; }
    public bool Open { get; set; }
}

public class ChangePasswordRequest
{
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}