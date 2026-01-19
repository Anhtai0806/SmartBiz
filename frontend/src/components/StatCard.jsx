import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = 'blue', trend }) => {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-icon">
                {icon}
            </div>
            <div className="stat-content">
                <h3 className="stat-title">{title}</h3>
                <p className="stat-value">{value}</p>
                {trend && (
                    <span className={`stat-trend ${trend.direction}`}>
                        {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
