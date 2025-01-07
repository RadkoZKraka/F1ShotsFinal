import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { Link } from "react-router-dom";
import UserCard from "../../Cards/User/UserCard"; // UserCard component for each profile
import ProfileService from "../../../Services/ProfileService"; // Service to fetch profiles

interface PublicProfile {
    username: string;
    id: string;
    // Add other properties as needed
}

const PublicProfilesPage: React.FC = () => {
    const [profiles, setProfiles] = useState<PublicProfile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<PublicProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("username");

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const profilesData = await ProfileService.getPublicProfiles(); // Call the service to get profiles
                setProfiles(profilesData);
                setFilteredProfiles(profilesData);
            } catch (err) {
                console.error("Failed to fetch profiles", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    useEffect(() => {
        const filtered = profiles.filter(profile =>
            profile.username.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProfiles(filtered);
    }, [search, profiles]);  // This effect only runs when profiles or search changes

    useEffect(() => {
        const sorted = [...filteredProfiles].sort((a, b) => {
            if (sortBy === "username") {
                return a.username.localeCompare(b.username);
            }
            return 0;
        });
        setFilteredProfiles(sorted);
    }, [sortBy]);  // This effect only runs when sorting criteria changes


    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Public Profiles
                </Typography>

                {/* Search and Filter section */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Search by username"
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
                                <MenuItem value="username">Username</MenuItem>
                                {/* Add more sorting options if needed */}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Profiles grid */}
                <Grid container spacing={4} sx={{ marginTop: 3 }}>
                    {filteredProfiles.map((profile) => (
                        <Grid item xs={12} sm={6} md={4} key={profile.id}>
                            <UserCard username={profile.username} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
};

export default PublicProfilesPage;
