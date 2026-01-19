import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, type = 'status' }) => {
    const getClassName = () => {
        if (type === 'role') {
            return `status-badge role-badge role-${status.toLowerCase()}`;
        }
        return `status-badge status-${status.toLowerCase()}`;
    };

    return (
        <span className={getClassName()}>
            {status}
        </span>
    );
};

export default StatusBadge;
