import React, { useEffect, useState } from "react";
import GroupPortfolioService from "../../../Services/GroupPortfolioService";
import { GroupPortfolio } from "../../../Models/GroupPortfolio";

interface StandingsListProps {
    groupId: string;
}

const StandingsList: React.FC<StandingsListProps> = ({ groupId }) => {
    const [standings, setStandings] = useState<{ userId: string; points: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                const data: GroupPortfolio = await GroupPortfolioService.GetGroupPortfolio(groupId);
                const fakeData = [
                    { userId: "user1", points: 120 },
                    { userId: "user2", points: 150 },
                    { userId: "user3", points: 90 },
                    { userId: "user4", points: 110 }
                ];
                
                setStandings(fakeData);
            } catch (error) {
                setError("Failed to fetch standings.");
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, [groupId]);

    if (loading) return <div>Loading standings...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="standings-list">
            <h3>Standings</h3>
            <ul>
                {standings.map((entry) => (
                    <li key={entry.userId} className="standings-item">
                        {entry.userId}: {entry.points} pts
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StandingsList;
