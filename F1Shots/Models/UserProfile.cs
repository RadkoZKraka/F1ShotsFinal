using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models
{
    public class UserProfile
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string Username { get; set; }

        public string PasswordHash { get; set; }

        public string Email { get; set; }

        // New 'IsPublic' field to indicate if the user's profile is public or private
        public bool Public { get; set; }
        public bool Open { get; set; }
    }
}