// PrivateRoute.tsx
import React from "react";
import { Route, Navigate } from "react-router-dom";

interface PrivateRouteProps {
    element: React.ReactNode;
    path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, ...rest }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Route {...rest} element={element} />;
};

export default PrivateRoute;
