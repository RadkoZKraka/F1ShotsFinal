import React from 'react';
import { useNavigate } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
import './UserCard.less';

interface UserCardProps {
    username: string;
    admin?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ username, admin }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/public-profile/${username}`);
    };

    return (
        <Paper className="user-card" elevation={3} onClick={handleClick}>
            <Typography variant="h6" className="user-card-title">
                {username}
                {admin && <span className="admin-badge"> ⭐ Admin</span>}
            </Typography>
        </Paper>
    );
};

export default UserCard;