import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    onClick,
    type = 'button',
    disabled = false,
    fullWidth = false,
    className = ''
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="btn-content">{children}</span>
            <span className="btn-ripple"></span>
        </button>
    );
};

export default Button;
