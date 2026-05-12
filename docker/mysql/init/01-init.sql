CREATE DATABASE IF NOT EXISTS gcat;
USE gcat;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    role ENUM('admin', 'manager', 'worker') DEFAULT 'worker',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    supplier VARCHAR(255),
    total_quantity INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    operation_id INT NOT NULL,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (operation_id) REFERENCES operations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,

    quantity INT NOT NULL,
    report_date DATE NOT NULL,

    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE INDEX idx_reports_date ON reports(report_date);
CREATE INDEX idx_assign_worker ON assignments(worker_id);

INSERT INTO users (phone, name, password, role)
VALUES (
    'admin',
    'Administrator',
    '$2a$10$xWxH3nD1SV6p/PEboLJeu.A9N075x5NGEMSx2GlMh1.zabRpv4h5e',
    'admin'
);
