import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PublicProfilesList.less";
import UserCard from "../../Cards/User/UserCard";
import { Friend } from "../../../Models/Friend"; // Import the LESS file

interface PublicProfilesListProps {
    publicProfiles: Friend[];
}

const PublicProfilesList: React.FC<PublicProfilesListProps> = ({ publicProfiles }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className="public-profiles-container">
            <button className="toggle-button" onClick={handleToggle}>
                {isExpanded ? "Hide Public Profiles" : "Show Public Profiles"}
            </button>

            {isExpanded && (
                <div className="profiles-list">
                    {publicProfiles.length > 0 ? (
                        <div className="profiles-grid">
                            {publicProfiles.map((profile) => (
                                <div key={profile.id} className="profile-card">
                                    <Link to={`/public-profile/${profile.username}`} className="profile-link">
                                        <UserCard username={profile.username} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No public profiles found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicProfilesList;
