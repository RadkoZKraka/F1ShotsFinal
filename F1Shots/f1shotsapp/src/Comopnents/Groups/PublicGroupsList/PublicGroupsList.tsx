// PublicGroups.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PublicGroupsList.less";
import { Group } from "../../../Models/Group";

interface PublicGroupsListProps {
    publicGroups: Group[];
}

const PublicGroupsList: React.FC<PublicGroupsListProps> = ({ publicGroups }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className="public-groups-container">
            <button className="toggle-button" onClick={handleToggle}>
                {isExpanded ? "Hide Public Groups" : "Show Public Groups"}
            </button>

            {isExpanded && (
                <div className="groups-list">
                    {publicGroups.length > 0 ? (
                        <div className="groups-grid">
                            {publicGroups.map((group) => (
                                <div key={group.id} className="group-card">
                                    <Link to={`/group/${group.id}`} className="group-link">
                                        <p> {group.name} </p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No public groups found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicGroupsList;
