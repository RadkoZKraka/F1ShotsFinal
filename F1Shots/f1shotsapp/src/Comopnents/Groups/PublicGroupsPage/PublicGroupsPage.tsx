import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import GroupService from "../../../Services/GroupService";
import GroupCard from "../../Cards/GroupCard/GroupCard"; // Service to fetch groups

interface Group {
    id: string;
    name: string;
    adminUserIds: string[];
    playersIds: string[];
    playersUserNames: string[];
    years: number[];
    motorsport: string;
    public: boolean;
    open: boolean;
}

const PublicGroupsPage: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null); // Track the ID of the expanded group

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groupsData = await GroupService.getPublicGroups(); // Call the service to get groups
                setGroups(groupsData);
                setFilteredGroups(groupsData);
            } catch (err) {
                console.error("Failed to fetch groups", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    useEffect(() => {
        const filtered = groups.filter((group) =>
            group.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredGroups(filtered);
    }, [search, groups]); // This effect only runs when groups or search changes

    useEffect(() => {
        const sorted = [...filteredGroups].sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "playersCount") {
                return b.playersIds.length - a.playersIds.length; // Sort by player count descending
            }
            return 0;
        });
        setFilteredGroups(sorted);
    }, [sortBy]); // This effect only runs when sorting criteria changes

    const toggleExpandedGroup = (groupId: string) => {
        setExpandedGroupId((prev) => (prev === groupId ? null : groupId)); // Toggle the expanded state
    };

    // Handle expanding/collapsing a specific group

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ height: "92vh", display: "flex", flexDirection: "column" }}>
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                    Public Groups
                </Typography>

                {/* Search and Filter section */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Search by group name"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="name">Group Name</MenuItem>
                                <MenuItem value="playersCount">Number of Players</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Groups grid */}
                <Grid container spacing={4} sx={{ marginTop: 3 }}>
                    {filteredGroups.map((group) => (
                        <Grid item xs={12} sm={6} md={4} key={group.id}>
                            <GroupCard
                                id={group.id}
                                name={group.name}
                                playerCount={group.playersIds.length}
                                playersUserNames={group.playersUserNames}
                                years={group.years}
                                isPublic={group.public}
                                isOpen={group.open}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
};

export default PublicGroupsPage;
