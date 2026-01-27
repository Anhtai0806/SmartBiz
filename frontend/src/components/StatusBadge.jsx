import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, type = 'status', children }) => {
    const getClassName = () => {
        if (type === 'role') {
            return `status-badge role-badge role-${status.toLowerCase()}`;
        }
        return `status-badge status-${status.toLowerCase()}`;
    };

    return (
        <span className={getClassName()}>
            {children || status}
        </span>
    );
};

export default StatusBadge;
