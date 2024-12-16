using F1Shots.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

public class UserStorage
{
    private readonly IMongoCollection<UserProfile> _users;

    public UserStorage(IMongoDatabase database)
    {
        _users = database.GetCollection<UserProfile>("UserProfiles");
    }

    public async Task<UserProfile> GetUserByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<UserProfile> GetUserByIdAsync(ObjectId userId)
    {
        return await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
    }

    public async Task CreateUserAsync(UserProfile userProfile)
    {
        await _users.InsertOneAsync(userProfile);
    }

    // Get users with public profiles (excluding the current user)
    public async Task<List<UserProfile>> GetUsersWithPublicProfilesAsync(ObjectId currentUserId)
    {
        return await _users
            .Find(u => u.Public == true && u.Id != currentUserId) // Exclude the current user
            .ToListAsync();
    }

    // Update user profile (username, email, and public visibility)
    public async Task<UpdateResult> UpdateUserProfileAsync(ObjectId userId, string newUsername, string newEmail, bool isPublic, bool isOpen)
    {
        var update = Builders<UserProfile>.Update
            .Set(u => u.Username, newUsername)
            .Set(u => u.Email, newEmail)
            .Set(u => u.Public, isPublic)
            .Set(u => u.Open, isOpen);

        var result = await _users.UpdateOneAsync(
            u => u.Id == userId,
            update
        );

        return result;
    }

    // Update user password
    public async Task<bool> UpdateUserPasswordAsync(ObjectId userId, string newHashedPassword)
    {
        var update = Builders<UserProfile>.Update.Set(u => u.PasswordHash, newHashedPassword);

        var result = await _users.UpdateOneAsync(
            u => u.Id == userId,
            update
        );

        return result.ModifiedCount > 0;
    }

    public async Task<UserPublicProfile> GetPublicProfileByUsernameAsync(string username)
    {
        var userProfile = await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
        var userPublicProfile = new UserPublicProfile
        {
            Username = userProfile.Username,
        };
        return userPublicProfile;
    }


    public async Task<UserProfile> GetUserByUsernameAsync(string username)
    {
        return await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
    }
}
