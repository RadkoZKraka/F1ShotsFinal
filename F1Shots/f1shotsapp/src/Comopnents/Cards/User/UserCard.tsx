import React from 'react';
import { Link } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
import './UserCard.less';

interface UserCardProps {
    username: string;
    admin?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ username, admin }) => {
    return (
        <Link to={`/public-profile/${username}`} className="user-card-link">
            <Paper className="user-card" elevation={3}>
                <Typography variant="h6" className="user-card-title">
                    {username}
                    {admin && <span className="admin-badge"> ⭐ Admin</span>}
                </Typography>
            </Paper>
        </Link>
    );
};

export default UserCard;
