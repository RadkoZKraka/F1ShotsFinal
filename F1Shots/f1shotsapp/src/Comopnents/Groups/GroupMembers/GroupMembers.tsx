import React from 'react';
import UserCard from "../../Cards/User/UserCard";

interface User {
    id: string;
    username: string;
}

interface GroupMembersProps {
    admins: User[]; // Admin user data
    players: User[]; // Player user data
}

const GroupMembers: React.FC<GroupMembersProps> = ({ admins, players }) => {
    // Combine admins and players, marking admins with `admin: true`
    const combinedUsers = players.map((player) => {
        const isAdmin = admins.some((admin) => admin.id === player.id);
        return {
            ...player,
            admin: isAdmin, // Add `admin` property if player is an admin
        };
    });

    return (
        <div className="group-members-container">
            <h3>Players</h3>
            <div className="user-cards-container">
                {combinedUsers.length > 0 ? (
                    combinedUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            username={user.username}
                            admin={user.admin} // Pass `admin` property to UserCard
                        />
                    ))
                ) : (
                    <p>No players found.</p>
                )}
            </div>
        </div>
    );
};

export default GroupMembers;
