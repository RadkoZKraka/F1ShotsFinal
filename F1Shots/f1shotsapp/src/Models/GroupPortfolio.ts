export interface GroupPortfolio {
    id: string; // Unique identifier for the GroupPortfolio
    groupId: string; // Reference to the associated group
    races: RaceData[]; // List of races (shots) for the group
    years: number[]; // List of years associated with the portfolio
    standings: MemberStanding[]; // Group standings
    creationDate: string; // When the portfolio was created
    lastUpdated: string; // Last modification time
    scoringRules: string; // Custom scoring rules for bets
}

interface RaceData {
    raceId: string; // Reference to the Race object
    isCompleted: boolean; // Status to indicate if the race is finished
    userBets: UserBets[]; // List of user bets for this race
    raceName: string; // Name of the race (e.g., "Monaco Grand Prix")
    raceLocation: string; // Location of the race (e.g., "Monte Carlo, Monaco")
    raceTime: string; // Start time of the race (ISO 8601 format)
    raceYear: number; // Year of the race
    totalLaps: number; // Total number of laps in the race
    circuitName: string; // Name of the circuit (e.g., "Circuit de Monaco")
    circuitLengthKm: number; // Length of the circuit in kilometers
    weatherCondition: string; // Weather conditions (e.g., "Sunny", "Rainy")
}

interface UserBets {
    userId: string; // Reference to the user who placed the bet
    userName: string; // Display name of the user
    predictedStandings: PredictedPosition[]; // User-selected driver standings with positions
    calculatedScore: number; // Score calculated based on ScoringRules and ActualStandings
}

interface PredictedPosition {
    position: number; // Predicted position (e.g., 1 for 1st place, 2 for 2nd, etc.)
    driver: Driver; // Driver chosen for this position
}

interface Driver {
    name: string; // Full name of the driver (e.g., "Lewis Hamilton")
    team: string; // The driver's team (e.g., "Mercedes-AMG Petronas Formula One Team")
    number: number; // Driver's race number (e.g., 44 for Lewis Hamilton)
    country: string; // Nationality of the driver (e.g., "United Kingdom")
    imageUrl: string; // URL to the driver's image (optional)
}

interface MemberStanding {
    userId: string; // Reference to the user
    userName: string; // Display name of the user
    points: number; // Points the user has earned in this group
    racesParticipated: number; // Number of races the user has placed bets on
    correctBets: number; // Number of bets where the user correctly predicted the outcome
    totalBets: number; // Total number of bets placed by the user in the group
    accuracy: number; // Percentage of correct bets (calculated as CorrectBets / TotalBets * 100)
    rank: number; // The user's rank within the group
}
