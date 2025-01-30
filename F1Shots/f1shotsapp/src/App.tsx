// App.tsx
import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";


import LandingPage from "./Comopnents/LandingPage/LandingPage";
import Layout from "./Comopnents/Layout/Layout";
import GroupsPage from "./Comopnents/Groups/GroupsPage/GroupsPage";
import FriendsPage from "./Comopnents/Friends/FriendsPage/FriendsPage";
import SettingsPage from "./Comopnents/Authorization/SettingsPage/SettingsPage";
import PublicProfilePage from "./Comopnents/Profiles/PublicProfilePage/PublicProfilePage";
import PrivateProfilePage from "./Comopnents/Profiles/PrivateProfilePage/PrivateProfilePage";
import Login from "./Comopnents/Authorization/Login/Login";
import Register from "./Comopnents/Authorization/Register/Register";
import NotificationPage from "./Comopnents/Navbar/NotificationPage";
import GroupPage from "./Comopnents/Groups/GroupPage/GroupPage";
import CreateGroup from "./Comopnents/Groups/CreateGroup/CreateGroup";
import GroupEdit from "./Comopnents/Groups/GroupEdit/GroupEdit";
import {AuthProvider} from "./Contexts/AuthContext";
import PublicProfilesPage from "./Comopnents/Profiles/PublicProfilesPage/PublicProfilesPage";
import PublicGroupsPage from "./Comopnents/Groups/PublicGroupsPage/PublicGroupsPage";


function App() {
    return (
        <AuthProvider>
        <Router>
            <Routes>
                {/* Define the Layout for all routes that need it */}
                <Route element={<Layout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create-group" element={<CreateGroup />} />
                    <Route path="/group/edit/:groupId" element={<GroupEdit />} />
                    <Route path="/groups" element={<GroupsPage />} />
                    <Route path="/group/:groupId" element={<GroupPage />} /> {/* Route for the GroupPage */}
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/settings" element={<SettingsPage />} /> {/* New Route */}
                    <Route path="/public-profile/:username" element={<PublicProfilePage />} />
                    <Route path="/public-profiles" element={<PublicProfilesPage />} />
                    <Route path="/public-groups" element={<PublicGroupsPage />} />
                    <Route path="/private-profile/:userId" element={<PrivateProfilePage />} />
                    <Route path="/notifications" element={<NotificationPage />} />

                </Route>

                {/* Define routes that do not need the Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
        </AuthProvider>
    );
}


export default App;
