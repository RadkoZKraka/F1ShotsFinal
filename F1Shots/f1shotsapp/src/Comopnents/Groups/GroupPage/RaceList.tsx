import React, { useEffect, useState } from "react";
import GroupPortfolioService from "../../../Services/GroupPortfolioService";
import { GroupPortfolio } from "../../../Models/GroupPortfolio";

interface RaceListProps {
    groupId: string;
    onSelectRace: (raceId: string) => void;
}

const RaceList: React.FC<RaceListProps> = ({ groupId, onSelectRace }) => {
    const [races, setRaces] = useState<{ raceId: string; raceName: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRaces = async () => {
            try {
                const data: GroupPortfolio = await GroupPortfolioService.GetGroupPortfolio(groupId);
                console.log('group portfolio',data)
                setRaces(data.races);
            } catch (error) {
                setError("Failed to fetch races.");
            } finally {
                setLoading(false);
            }
        };

        fetchRaces();
    }, [groupId]);

    if (loading) return <div>Loading races...</div>;
    if (error) return <div>{error}</div>;
    console.log(races)
    return (
        <div className="race-list">
            <h3>Races</h3>
            <ul>
                {races.map((race) => (
                    <li
                        key={race.raceId}
                        onClick={() => onSelectRace(race.raceId)} // This triggers the handleSelectRace function in GroupPage
                        className="race-item"
                    >
                        {race.raceName}
                    </li>

                ))}
            </ul>
        </div>
    );
};

export default RaceList;
