using System.Text.Json;
using F1Shots.Models;
using F1Shots.Models.Responses;
using F1Shots.Storage;
using MongoDB.Bson.IO;

namespace F1Shots.Services;

public class GroupPortfolioService
{
    private readonly GroupPortfolioStorage _groupPortfolioStorage;
    private readonly HttpClient _httpClient;

    public GroupPortfolioService(GroupPortfolioStorage groupPortfolioStorage, HttpClient httpClient)
    {
        _groupPortfolioStorage = groupPortfolioStorage;
        _httpClient = httpClient;
    }

    public async Task<GroupPortfolio> CreateGroupPortfolioAsync(GroupPortfolio groupPortfolio)
    {
        return await _groupPortfolioStorage.CreateGroupPortfolioAsync(groupPortfolio);
    }

    public async Task<GroupPortfolio> GetGroupPortfolioAsync(string groupId)
    {
        return await _groupPortfolioStorage.GetGroupPortfolioByGroupIdAsync(groupId);
    }

    public async Task<List<RaceData>> GetRacesInfo(int year)
    {
        var races = new List<RaceData>();
        // Make a request to the OpenF1 API (adjust URL for the specific year)
        var apiUrl = $"http://api.jolpi.ca/ergast/f1/{year}/";
        var response = await _httpClient.GetAsync(apiUrl);

        if (response.IsSuccessStatusCode)
        {
            // Deserialize the response
            var jsonResponse = await response.Content.ReadAsStringAsync();
            var raceResponse = JsonSerializer.Deserialize<JolpicaApiResponse>(jsonResponse);


            // Extract the races from the API response
            var raceList = raceResponse.MRData.RaceTable.Races;

            // Map the OpenF1 race data to your RaceData model
            races = raceList.Select(race => new RaceData
            {
                RaceId = Guid.NewGuid(), // Use round as race ID or generate another unique identifier
                RaceName = race.RaceName,
                RaceLocation = $"{race.Circuit.Location.Locality}, {race.Circuit.Location.Country}",
                RaceTime = DateTime.Parse(race.Date + " " + race.Time), // Combine date and time to get full race time
                RaceYear = year,
                TotalLaps = 0, // OpenF1 API does not provide total laps, you can leave this as 0 or populate later if available
                CircuitName = race.Circuit.CircuitName,
                CircuitLengthKm = 0, // Circuit length isn't provided in the response, handle accordingly
                WeatherCondition = "Unknown" // Weather condition is not in the response, set a default or update later
            }).ToList();
        }
        return races;
    }
}