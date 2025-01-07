import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    IconButton,
    Collapse,
    List,
    ListItem,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { Group } from "../../../Models/Group";
import UserCard from "../../Cards/User/UserCard";

interface GroupListProps {
    groups: Group[];
}

const GroupList: React.FC<GroupListProps> = ({ groups = [] }) => {
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleGroupClick = (groupId: string) => {
        navigate(`/group/${groupId}`);
    };

    const toggleUsersDisplay = (groupId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent navigation when toggling the user list
        setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <Typography variant="h4" style={{ marginBottom: "20px" }}>
                Group List
            </Typography>
            {!Array.isArray(groups) || groups.length === 0 ? (
                <Typography variant="h6" color="textSecondary" align="center">
                    No Groups found.
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Group Name</strong></TableCell>
                                <TableCell><strong>Public</strong></TableCell>
                                <TableCell><strong>Open</strong></TableCell>
                                <TableCell><strong>Players</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map((group) => (
                                <React.Fragment key={group.id}>
                                    <TableRow
                                        hover
                                        onClick={() => handleGroupClick(group.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.public ? "Yes" : "No"}</TableCell>
                                        <TableCell>{group.open ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={(event) => toggleUsersDisplay(group.id, event)}
                                            >
                                                {expandedGroupId === group.id ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ padding: 0 }}>
                                            <Collapse
                                                in={expandedGroupId === group.id}
                                                timeout="auto"
                                                unmountOnExit
                                            >
                                                <List>
                                                    {group.playersUserNames.map(
                                                        (username: string, index: number) => (
                                                            <ListItem key={index} style={{ padding: "10px 0" }}>
                                                                <UserCard username={username}  />
                                                            </ListItem>
                                                        )
                                                    )}
                                                </List>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default GroupList;
