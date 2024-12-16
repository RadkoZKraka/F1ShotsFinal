import React, { useState } from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import "./PublicProfilesList.less"; // Import the LESS file

interface PublicProfile {
    id: string;
    username: string;
}

interface PublicProfilesListProps {
    publicProfiles: PublicProfile[];
}

const PublicProfilesList: React.FC<PublicProfilesListProps> = ({ publicProfiles }) => {
    const [isExpanded, setIsExpanded] = useState(false);  // State for toggling visibility
    const handleToggle = () => {
        setIsExpanded((prev) => !prev);  // Toggle the expanded state
    };

    return (
        <div className="public-profiles-container">
            <button className="toggle-button" onClick={handleToggle}>
                {isExpanded ? "Hide Public Profiles" : "Show Public Profiles"}
            </button>

            {isExpanded && (
                <div>
                    {publicProfiles.length > 0 ? (
                        <table className="profiles-table">
                            <thead>
                            <tr>
                                <th>Username</th>
                            </tr>
                            </thead>
                            <tbody>
                            {publicProfiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td>
                                        {/* Make the username clickable using Link */}
                                        <Link to={`/public-profile/${profile.username}`} className="username-link">
                                            {profile.username}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No public profiles found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicProfilesList;
