import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GroupPortfolioCard from "../../Cards/GroupPortfolioCard/GroupPortfolioCard";
import RaceBet from "./RaceBet";
import GroupInfo from "./GroupInfo";
import RaceList from "./RaceList";
import StandingsList from "./StandingsList";
import "./GroupPage.less";

const GroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [selectedRace, setSelectedRace] = useState<string | null>(null);

    if (!groupId) {
        return <p>Group not found.</p>;
    }

    const handleSelectRace = (raceId: string) => {
        console.log("Race selected:", raceId);
        setSelectedRace(raceId);
    };

    const handleCloseBet = () => {
        setSelectedRace(null); // Close the RaceBet component by setting selectedRace to null
    };

    return (
        <div className={`group-page ${selectedRace ? 'race-selected' : ''}`}>
            <div className="top-left">
                <GroupPortfolioCard groupId={groupId} />
            </div>

            <div className={`center ${selectedRace ? 'moved-middle' : ''}`}>
                {!selectedRace ? (
                    <p>Select a race to see your bets.</p>
                ) : (
                    <RaceBet raceId={selectedRace} onCloseBet={handleCloseBet} /> // Pass handleCloseBet as a prop
                )}
            </div>

            <div className={`races-container ${selectedRace ? 'moved-under-portfolio' : ''}`}>
                <RaceList groupId={groupId} onSelectRace={handleSelectRace} />
            </div>

            <div className={`standings-container ${selectedRace ? 'moved-to-right' : ''}`}>
                <StandingsList groupId={groupId} />
            </div>

            <div className="group-info">
                <GroupInfo groupId={groupId} />
            </div>
        </div>
    );
};

export default GroupPage;
