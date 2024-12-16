import React, { useEffect, useState } from "react";
import './AlertComponent.less';

interface AlertProps {
    type: "success" | "error" | "info"; // Message type
    message: string; // The alert message
    onClose: () => void; // Function to close the alert
}

const AlertComponent: React.FC<AlertProps> = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 15000); // Auto-close after 15 seconds

        return () => {
            clearTimeout(timer); // Clean up on component unmount or if closed manually
        };
    }, [onClose]);

    return (
        <div className={`alert-container ${type}`}>
            <div className="alert-message">
                {message}
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default AlertComponent;
