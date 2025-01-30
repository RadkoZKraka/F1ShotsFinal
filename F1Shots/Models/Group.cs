using MongoDB.Bson;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models
{
    public class Group
    {
        public ObjectId Id { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string GroupPortfolioId { get; set; }
        public string Name { get; set; }
        public List<ObjectId> AdminUserIds { get; set; } // List of admin user IDs
        public List<ObjectId> PlayersIds { get; set; } // List of admin user IDs
        public List<string> PlayersUserNames { get; set; } // List of admin user IDs
        public List<int> Years { get; set; } // Years the group wants to participate in
        public Motorsport Motorsport { get; set; } // Years the group wants to participate in
        public bool Public { get; set; } // Group visibility (public or private)
        public bool Open { get; set; } // Can request to join
    }
}

public enum Motorsport
{
    F1 = 0,
    F2 = 1,
    F3 = 2,
    WEC = 3,
    MotoGp = 4
}