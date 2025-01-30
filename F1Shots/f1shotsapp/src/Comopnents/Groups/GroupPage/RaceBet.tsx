import React, { useEffect, useState } from "react";
import RaceBetService from "../../../Services/RaceBetService";
import { Card, CardContent, Button, Typography } from "@mui/material";

interface RaceBetProps {
    raceId: string;
    onCloseBet: () => void; // Function to close the bet
}

const RaceBet: React.FC<RaceBetProps> = ({ raceId, onCloseBet }) => {
    const [userBets, setUserBets] = useState<any[]>([]);  // Replace with actual bet model
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBets = async () => {
            try {
                const bets = await RaceBetService.getUserBets(raceId);  // Fetch the user's bets
                setUserBets(bets);
            } catch (error) {
                console.error("Error fetching bets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBets();
    }, [raceId]);

    const handleCloseBet = () => {
        onCloseBet(); // Call the function passed from GroupPage to close the bet
    };

    if (loading) return <div>Loading your bets...</div>;

    return (
        <Card sx={{ boxShadow: 3, padding: 2, marginBottom: 2 }}>
            <CardContent>
                <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
                    Your Bets for Race {raceId}
                </Typography>
                {userBets.length > 0 ? (
                    <ul style={{ padding: 0 }}>
                        {userBets.map((bet, index) => (
                            <li key={index} style={{ marginBottom: "15px", listStyleType: "none" }}>
                                <Typography variant="body1" component="div">
                                    <strong>{bet.teamName}</strong>: {bet.amount} points
                                </Typography>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        You haven't placed any bets for this race yet.
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseBet}
                    sx={{
                        marginTop: "8px",
                        padding: "8px 16px",
                    }}
                >
                    Close Race
                </Button>
            </CardContent>
        </Card>
    );
};

export default RaceBet;
