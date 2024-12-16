import React, { useState } from "react";
import "./FriendSearchModal.less";

interface FriendSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (friendUsername: string) => void;
    error: string | null;
}

const FriendSearchModal: React.FC<FriendSearchModalProps> = ({ isOpen, onClose, onSearch, error }) => {
    const [friendUsername, setFriendUsername] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSearchClick = () => {
        if (!friendUsername.trim()) {
            setLocalError("Please enter a friend's username.");
            return;
        }
        setLocalError(null); // Clear any previous error
        onSearch(friendUsername);
        setFriendUsername("");
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <h3>Search for Friend</h3>
                {(error || localError) && <p className="error">{error || localError}</p>}
                <input
                    type="text"
                    placeholder="Enter friend's username"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    className="modal-input"
                />
                <button onClick={handleSearchClick} className="modal-button">
                    Send Request
                </button>
                <button onClick={onClose} className="modal-button secondary">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default FriendSearchModal;
