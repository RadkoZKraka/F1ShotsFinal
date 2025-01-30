import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import AlertManager from "../../Managers/AlertManager";
import { useAuth } from "../../Contexts/AuthContext";
import Navbar from "../Navbar/Navbar/Navbar";

// Create the RefreshContext
interface RefreshContextType {
    refreshCounter: number;
    triggerRefresh: () => void;
}

export const RefreshContext = createContext<RefreshContextType>({
    refreshCounter: 0,
    triggerRefresh: () => {},
});


const Layout = () => {
    const { token } = useAuth();
    const [refreshCounter, setRefreshKey] = useState(0);

    // Function to trigger a refresh
    const triggerRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <RefreshContext.Provider value={{ refreshCounter, triggerRefresh }}>
            <div>
                {/* Show Navbar only if user is logged in */}
                {token && <Navbar />}
                <AlertManager />

                {/* Render the page content */}
                <div style={{ padding: "20px" }}>
                    <Outlet />
                </div>
            </div>
        </RefreshContext.Provider>
    );
};

export default Layout;
