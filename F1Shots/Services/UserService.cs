using F1Shots.Controllers;
using F1Shots.Models;
using F1Shots.Services.Requests;
using MongoDB.Bson;
using MongoDB.Driver;

public class UserService
{
    private readonly UserStorage _userStorage;

    public UserService(UserStorage userStorage)
    {
        _userStorage = userStorage;
    }
    // Method to get a user by their ObjectId
    public async Task<UserProfile> GetUserByIdAsync(ObjectId userId)
    {
        return await _userStorage.GetUserByIdAsync(userId);

    }
    public async Task<UserPublicProfile> GetPublicUserByUsernameAsync(string username)
    {
        return await _userStorage.GetPublicProfileByUsernameAsync(username);
    }
    public async Task<UserProfile> GetUserByEmailAsync(string email)
    {
        return await _userStorage.GetUserByEmailAsync(email);
    }
    
    public async Task<UpdateResult> UpdateUserProfileAsync(ObjectId userId, UpdateProfileRequest request)
    {
        // Update the user profile in the database
        return await _userStorage.UpdateUserProfileAsync(userId, request.Username, request.Email, request.Public, request.Open);
    }

    public async Task<bool> ChangeUserPasswordAsync(ObjectId userId, string oldPassword, string newPassword)
    {
        var user = await _userStorage.GetUserByIdAsync(userId);

        if (user == null || !VerifyPassword(user, oldPassword))
        {
            return false;
        }

        var newHashedPassword = HashPassword(newPassword);
        return await _userStorage.UpdateUserPasswordAsync(userId, newHashedPassword);
    }

    public bool VerifyPassword(UserProfile user, string password)
    {
        // Implement the password verification logic here, comparing the hashed password with the stored hash
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public string HashPassword(string password)
    {
        // Hash the password using a secure method like BCrypt
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public async Task CreateUserAsync(UserProfile userProfile)
    {
        await _userStorage.CreateUserAsync(userProfile);
    }

    public async Task<List<UserProfile>> GetUsersWithPublicProfilesAsync(ObjectId userId)
    {
        return await _userStorage.GetUsersWithPublicProfilesAsync(userId);
    }

    public async Task<UserProfile> GetUserByUsernameAsync(string username)
    {
        return await _userStorage.GetUserByUsernameAsync(username);

    }
}