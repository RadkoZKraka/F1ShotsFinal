import React, { useState } from "react";
import AlertComponent from "../Comopnents/Alert/AlertComponent";

interface Alert {
    id: string;
    type: "success" | "error" | "info";
    message: string;
}

const AlertManager: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // Function to add an alert
    const addAlert = (type: "success" | "error" | "info", message: string) => {
        const newAlert: Alert = {
            id: Date.now().toString(), // Unique ID based on timestamp
            type,
            message,
        };

        setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    };

    // Function to close an alert
    const closeAlert = (id: string) => {
        setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
    };

    return (
        <div className="alert-manager">
            {/* Example usage: Show alerts dynamically */}
            {alerts.map(alert => (
                <AlertComponent
                    key={alert.id}
                    type={alert.type}
                    message={alert.message}
                    onClose={() => closeAlert(alert.id)}
                />
            ))}
        </div>
    );
};

export default AlertManager;
