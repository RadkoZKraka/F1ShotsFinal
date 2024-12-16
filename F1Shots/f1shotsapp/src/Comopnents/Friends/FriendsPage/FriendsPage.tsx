import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FriendsPage.less";
import FriendsList from "../FriendsList/FriendsList";
import FriendshipService from "../../../Services/FriendshipService";

const FriendsPage: React.FC = () => {
    const [friends, setFriends] = useState<any[]>([]); // Friends list state
    const [error, setError] = useState<string | null>(null); // Error state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const fetchedFriends = await FriendshipService.getAllFriends();
                setFriends(fetchedFriends);
            } catch (err) {
                setError("Failed to fetch friends.");
                console.error(err);
            }
        };

        fetchFriends();
    }, []);

    const handleAddFriend = () => {
        navigate("/add-friend"); // Redirect to add friend page
    };

    return (
        <div className="friends-page-container">
            <h2>Your Friends</h2>
            {error && <p className="error-message">{error}</p>}

            <FriendsList friends={friends} />

            <button onClick={handleAddFriend} className="add-friend-button">
                Add New Friend
            </button>
        </div>
    );
};

export default FriendsPage;
