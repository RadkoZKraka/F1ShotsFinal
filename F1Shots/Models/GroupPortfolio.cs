using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1Shots.Models;

public class GroupPortfolio
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } // Unique identifier for the GroupPortfolio

    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } // Reference to the associated group

    public List<RaceData> Races { get; set; } = new List<RaceData>(); // List of races (shots) for the group
    public List<int> Years { get; set; } = new List<int>();

    public List<MemberStanding> Standings { get; set; } = new List<MemberStanding>(); // Group standings

    public DateTime CreationDate { get; set; } = DateTime.UtcNow; // When the portfolio was created

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow; // Last modification time

    public string ScoringRules { get; set; } // Custom scoring rules for bets
}


public class RaceData
{
    [BsonRepresentation(BsonType.String)]
    public Guid RaceId { get; set; } // Reference to the Race object

    public bool IsCompleted { get; set; } // Status to indicate if the race is finished
    
    public List<UserBets> UserBets { get; set; }

    public string RaceName { get; set; } // Name of the race (e.g., "Monaco Grand Prix")

    public string RaceLocation { get; set; } // Location of the race (e.g., "Monte Carlo, Monaco")

    public DateTime RaceTime { get; set; } // Start time of the race

    public int RaceYear { get; set; } // Year of the race

    public int TotalLaps { get; set; } // Total number of laps in the race

    public string CircuitName { get; set; } // Name of the circuit (e.g., "Circuit de Monaco")

    public double CircuitLengthKm { get; set; } // Length of the circuit in kilometers

    public string WeatherCondition { get; set; } // Weather conditions (e.g., "Sunny", "Rainy")
}

public class UserBets
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } // Reference to the user who placed the bet

    public string UserName { get; set; } // Display name of the user

    public List<PredictedPosition> PredictedStandings { get; set; } = new List<PredictedPosition>(); // User-selected driver standings with positions

    public double CalculatedScore { get; set; } // Score calculated based on ScoringRules and ActualStandings
}

public class PredictedPosition
{
    public int Position { get; set; } // Predicted position (e.g., 1 for 1st place, 2 for 2nd, etc.)

    public Driver Driver { get; set; } // Driver chosen for this position
}

public class Driver
{
    public string Name { get; set; } // Full name of the driver (e.g., "Lewis Hamilton")

    public string Team { get; set; } // The driver's team (e.g., "Mercedes-AMG Petronas Formula One Team")

    public int Number { get; set; } // Driver's race number (e.g., 44 for Lewis Hamilton)

    public string Country { get; set; } // Nationality of the driver (e.g., "United Kingdom")

    public string ImageUrl { get; set; } // URL to the driver's image (optional)
}



public class MemberStanding
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } // Reference to the user

    public string UserName { get; set; } // Display name of the user

    public int Points { get; set; } // Points the user has earned in this group

    public int RacesParticipated { get; set; } // Number of races the user has placed bets on

    public int CorrectBets { get; set; } // Number of bets where the user correctly predicted the outcome

    public int TotalBets { get; set; } // Total number of bets placed by the user in the group

    public double Accuracy { get; set; } // Percentage of correct bets (calculated as CorrectBets / TotalBets * 100)

    public int Rank { get; set; } // The user's rank within the group
}
