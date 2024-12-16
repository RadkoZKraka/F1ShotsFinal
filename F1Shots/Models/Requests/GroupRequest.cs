public class GroupRequest
{
    public string Id { get; set; } // This is a string, and we'll convert it into ObjectId
    public string Name { get; set; }
    public List<string> AdminUserIds { get; set; } // List of admin user IDs (strings)
    public List<string> PlayersIds { get; set; } // List of player IDs (strings)
    public List<string> PlayersUserNames { get; set; }
    public List<int> Years { get; set; }
    public Motorsport Motorsport { get; set; } // Years the group wants to participate in

    public bool Public { get; set; }
    public bool Open { get; set; }
}