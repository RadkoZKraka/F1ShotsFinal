namespace F1Shots.Models.Responses;

public class JolpicaApiResponse
{
    public MRData MRData { get; set; }
}

public class MRData
{
    public string Series { get; set; }
    public RaceTable RaceTable { get; set; }
}

public class RaceTable
{
    public string Season { get; set; }
    public List<Race> Races { get; set; }
}

public class Race
{
    public string Season { get; set; }
    public int Round { get; set; }
    public string RaceName { get; set; }
    public DateTime Date { get; set; }
    public string Time { get; set; }
    public Circuit Circuit { get; set; }
}

public class Circuit
{
    public string CircuitId { get; set; }
    public string CircuitName { get; set; }
    public Location Location { get; set; }
}

public class Location
{
    public string Locality { get; set; }
    public string Country { get; set; }
}