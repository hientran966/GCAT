SET FOREIGN_KEY_CHECKS = 0;

-- WORKERS (Nhân công)
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
	password_hash VARCHAR(255) NOT NULL,
    role ENUM('manager','user') DEFAULT 'user',
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- PRODUCTS (Sản phẩm)
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,      -- mã sản phẩm
    name VARCHAR(255) NOT NULL,
    total_quantity INT NOT NULL,            -- tổng số lượng phải làm
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- PRODUCT STAGES (Công đoạn)
DROP TABLE IF EXISTS product_stages;
CREATE TABLE product_stages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    stage_name VARCHAR(255) NOT NULL,       -- tên công đoạn
    price DECIMAL(10,2) NOT NULL,           -- giá trả cho công đoạn
    stage_quantity INT NOT NULL,            -- SL yêu cầu trong công đoạn
	image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ASSIGNMENTS (Giao công đoạn cho nhân công)
DROP TABLE IF EXISTS stage_assignments;
CREATE TABLE stage_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stage_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    assigned_quantity INT NOT NULL,         -- giao bao nhiêu sản phẩm trong công đoạn
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (stage_id) REFERENCES product_stages(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- DAILY REPORTS (Nhân công báo cáo mỗi ngày)
DROP TABLE IF EXISTS daily_reports;
CREATE TABLE daily_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stages_id BIGINT NOT NULL,
    report_date DATE NOT NULL,              -- ngày báo cáo
    quantity_done INT NOT NULL,             -- số lượng đã làm trong ngày
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (stages_id) REFERENCES product_stages(id)
);

-- ACTIVITY LOGS (Lịch sử hệ thống)
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('product','stage','assignment','report','worker') NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    actor VARCHAR(255),
    detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

SET FOREIGN_KEY_CHECKS = 1;