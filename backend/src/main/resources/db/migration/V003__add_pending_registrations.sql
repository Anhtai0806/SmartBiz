CREATE TABLE IF NOT EXISTS pending_registrations (
    id BINARY(16) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pending_registrations_email (email),
    UNIQUE KEY uk_pending_registrations_phone (phone)
);
