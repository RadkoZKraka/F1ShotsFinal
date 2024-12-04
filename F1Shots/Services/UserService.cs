using F1Shots.Models;
using Microsoft.AspNetCore.Identity;

namespace F1Shots.Services;

public class UserService
{
    private readonly PasswordHasher<UserProfile> _passwordHasher;

    public UserService()
    {
        _passwordHasher = new PasswordHasher<UserProfile>();
    }

    // Hash a user's password
    public string HashPassword(string password)
    {
        var user = new UserProfile();  // Dummy user object, only for hashing
        return _passwordHasher.HashPassword(user, password);
    }

    // Verify if the entered password matches the hashed password
    public bool VerifyPassword(UserProfile user, string enteredPassword)
    {
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, enteredPassword);
        return result == PasswordVerificationResult.Success;
    }
}