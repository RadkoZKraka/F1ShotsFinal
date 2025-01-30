import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FriendsPage.less";
import FriendsList from "../FriendsList/FriendsList";
import FriendshipService from "../../../Services/FriendshipService";
import AddFriendModal from "../../Modals/AddFriendModal";
import {useAuth} from "../../../Contexts/AuthContext";
import ProfileService from "../../../Services/ProfileService";

const FriendsPage: React.FC = () => {
    const [friends, setFriends] = useState<any[]>([]); // Friends list state
    const [error, setError] = useState<string | null>(null); // Error state
    const [currentUserName, setCurrentUserName] = useState<string>(''); // Error state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const fetchedFriends = await FriendshipService.getAllFriends();
                const user = await ProfileService.getUserProfile();
                setCurrentUserName(user.username);
                setFriends(fetchedFriends);
            } catch (err) {
                setError("Failed to fetch friends.");
                console.error(err);
            }
        };

        fetchFriends();
    }, []);

    const handleAddFriend = () => {
        setIsModalOpen(true); // Open the modal
    };

    const handleFriendAdded = () => {
        // Reload the friends list after adding a friend
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
    };

    return (
        <div className="friends-page-container">
            <h2>Your Friends</h2>
            {error && <p className="error-message">{error}</p>}

            <FriendsList friends={friends} />

            <button onClick={handleAddFriend} className="add-friend-button">
                Add New Friend
            </button>

            {/* Add Friend Modal */}
            <AddFriendModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFriendAdded={handleFriendAdded}
                username={currentUserName} // Replace this with actual username
            />
        </div>
    );
};

export default FriendsPage;
