import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group } from "../../../Models/Group";
import GroupService from "../../../Services/GroupService";
import ProfileService from "../../../Services/ProfileService";
import { GroupRelationStatus } from "../../Modals/RequestJoinModal";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/OpenInFull";
import ExpandLessIcon from "@mui/icons-material/CloseFullscreen";
import GroupMembers from "../GroupMembers/GroupMembers";
import "./GroupInfo.less"

const GroupInfo: React.FC<{ groupId: string }> = ({ groupId }) => {
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false);
    const [openBanDialog, setOpenBanDialog] = useState<boolean>(false);
    const [groupRelation, setGroupRelation] = useState<GroupRelationStatus | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed state

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const [groupData, currentUserData] = await Promise.all([
                    GroupService.getGroupByIdAsync(groupId),
                    ProfileService.getUserProfile(),
                ]);

                if (!groupData) {
                    setError("You are not authorized to view this group.");
                } else {
                    setGroup(groupData);
                    const relation = await GroupService.checkGroupRelation(groupData.name);
                    setCurrentUser(currentUserData);
                    setGroupRelation(relation.status);
                }
            } catch (err) {
                setError("Failed to fetch group details.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [groupId]);

    const isAdmin = currentUser && group && group.adminUserIds.includes(currentUser.id);
    const isMember =
        group &&
        currentUser &&
        (groupRelation === GroupRelationStatus.Accepted || group?.playersIds.includes(currentUser.id));

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLeaveGroup = async () => {
        try {
            await GroupService.leaveGroup(groupId);
            setGroupRelation(GroupRelationStatus.None);
            navigate("/groups");
        } catch (err) {
            setError("Failed to leave group.");
        }
    };

    const handleBanGroup = async () => {
        try {
            await GroupService.banGroup(group!.name);
            setGroupRelation(GroupRelationStatus.GroupBanned);
            navigate("/groups");
        } catch (err) {
            setError("Failed to ban group.");
        }
    };

    const handleJoinGroup = async () => {
        try {
            await GroupService.requestGroupJoin(groupId);
            setGroupRelation(GroupRelationStatus.JoinPending);
        } catch (err) {
            setError("Failed to request to join group.");
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed((prevState) => !prevState);
    };

    if (loading) {
        return <CircularProgress color="primary" />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!group) {
        return <p>Group not found.</p>;
    }

    const admins = group.adminUserIds.map((id, index) => ({
        id,
        username: group.adminUserIds[index],
    }));

    const players = group.playersIds.map((id, index) => ({
        id,
        username: group.playersUserNames[index],
    }));

    return (
        <Paper
            sx={{
                position: "fixed",
                top: "20%",
                right: isCollapsed ? "0" : "10px",
                width: isCollapsed ? "120px" : "300px", // Small width when collapsed
                padding: isCollapsed ? "0.5rem" : "1rem",
                boxShadow: 3,
                borderRadius: 2,
                height: "auto",
                zIndex: 9999,
                transition: "all 0.3s ease", // Smooth transition for collapsing
                display: "flex",
                flexDirection: isCollapsed ? "row" : "column", // Adjust layout based on state
                alignItems: isCollapsed ? "center" : "flex-start",
                justifyContent: isCollapsed ? "center" : "flex-start",
            }}
        >
            {/* Collapse/Expand Button */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "300px",
                    overflow: "hidden", // Prevents overflow
                    textOverflow: "ellipsis", // Adds ellipsis if the name overflows
                    whiteSpace: "nowrap", // Keeps the text on a single line
                }}
            >
                {isCollapsed ? (
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{
                            fontWeight: 600,
                            marginBottom: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {group.name}
                    </Typography>
                ) : (
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            marginBottom: 1,
                            width: '200px'
                        }}
                    >
                        {group.name}
                    </Typography>
                )}

                <IconButton
                    onClick={toggleCollapse}
                    sx={{
                        marginLeft: isCollapsed ? 0 : "auto",
                        width: "auto"
                    }}
                >
                    {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
            </Box>


            {!isCollapsed && (
                <>
                    <List sx={{ marginBottom: 2 }}>
                        <ListItem>
                            <ListItemText primary="Public Group" secondary={group.public ? "Yes" : "No"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Open Group" secondary={group.open ? "Yes" : "No"} />
                        </ListItem>
                    </List>

                    <GroupMembers admins={admins} players={players} />

                    <Box sx={{ textAlign: "center", marginTop: 2 }}>
                        {isAdmin && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => navigate(`/group/edit/${groupId}`)}
                            >
                                Edit Group
                            </Button>
                        )}
                        {!isMember && (
                            <Button variant="contained" color="primary" onClick={handleJoinGroup}>
                                Request to Join
                            </Button>
                        )}
                    </Box>
                </>
            )}

            <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
                <DialogTitle>Confirm Leave</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to leave the group?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaveDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLeaveGroup} color="error">
                        Leave Group
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBanDialog} onClose={() => setOpenBanDialog(false)}>
                <DialogTitle>Confirm Ban</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to ban the group?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBanDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleBanGroup} color="error">
                        Ban Group
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default GroupInfo;
