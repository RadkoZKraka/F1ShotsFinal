using F1Shots.Models;
using MongoDB.Driver;

namespace F1Shots.Services;

public class MongoDBService
{
    private readonly IMongoCollection<UserProfile> _userProfiles;
    private readonly IMongoDatabase _database;

    public MongoDBService(IConfiguration config)
    {
        var connectionString = config.GetValue<string>("MongoDB:ConnectionString");
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(config.GetValue<string>("MongoDB:Database"));
        _userProfiles =
            _database.GetCollection<UserProfile>(
                "UserProfiles"); // Collection name should match your MongoDB collection
    }

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }

    public async Task AddUserProfileAsync(UserProfile user)
    {
        await _userProfiles.InsertOneAsync(user);
    }

    public async Task<List<UserProfile>> GetUserProfilesAsync()
    {
        return await _userProfiles.Find(user => true).ToListAsync();
    }
}