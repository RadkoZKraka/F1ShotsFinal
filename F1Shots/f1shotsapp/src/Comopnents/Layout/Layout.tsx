// Layout.tsx
import React from "react";

import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import AlertManager from "../../Managers/AlertManager";

const Layout = () => {
    const token = localStorage.getItem("authToken");

    return (
        <div>
            {/* Show Navbar only if user is logged in */}
            {token && <Navbar />}
            <AlertManager />

            {/* Render the page content */}
            <div style={{ padding: "20px" }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
