import React, { useState } from 'react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    icon = null,
    required = false,
    disabled = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={`input-wrapper ${error ? 'input-error' : ''} ${isFocused ? 'input-focused' : ''}`}>
            {icon && <span className="input-icon">{icon}</span>}

            <div className="input-field">
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={value ? 'has-value' : ''}
                />
                {label && (
                    <label className={value || isFocused ? 'label-float' : ''}>
                        {label}
                        {required && <span className="required-mark">*</span>}
                    </label>
                )}
            </div>

            {type === 'password' && (
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
            )}

            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Input;
