using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models;

public class UserPublicProfile
{
    public string Username { get; set; }
    
    public List<Group> Groups { get; set; } = new List<Group>();  // List of groups the user is attached to
}