import React from 'react';
import { Link } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
import './UserCard.less'; // Assuming a LESS file for styling

interface UserCardProps {
    username: string;
    admin?: boolean; // Optional property to indicate admin status
}

const UserCard: React.FC<UserCardProps> = ({ username, admin }) => {
    return (
        <Paper className="user-card" elevation={3}>
            <Typography variant="h6" className="user-card-title">
                <Link to={`/public-profile/${username}`} className="username-link">
                    {username}
                </Link>
                {admin && <span className="admin-badge"> ⭐ Admin</span>} {/* Badge for admins */}
            </Typography>
        </Paper>
    );
};

export default UserCard;
