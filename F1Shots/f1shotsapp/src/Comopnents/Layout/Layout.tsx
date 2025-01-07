import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AlertManager from "../../Managers/AlertManager";
import {useAuth} from "../../AuthContext";
import Navbar from "../Navbar/Navbar/Navbar";

const Layout = () => {
    const { token } = useAuth();



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
