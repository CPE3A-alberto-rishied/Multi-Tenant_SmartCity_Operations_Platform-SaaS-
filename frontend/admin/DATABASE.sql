-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Admin/Staff)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Main Admin', 'Staff Admin') NOT NULL, 
    dept_id INT, 
    status ENUM('Active', 'Disabled') DEFAULT 'Active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- 3. News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM(
        'Public Welfare', 'Urgent Alert', 'Health', 'Traffic', 
        'Road Work', 'Water Service', 'Power Interruption',
        'Weather', 'Security', 'Community'
    ) DEFAULT 'Public Welfare',
    content TEXT NOT NULL,
    admin_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Article Images Table (For Multiple Photo Uploads)
CREATE TABLE IF NOT EXISTS article_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL, 
    is_featured TINYINT(1) DEFAULT 0, 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_article_news
        FOREIGN KEY (article_id) 
        REFERENCES news_articles(article_id) 
        ON DELETE CASCADE
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Incident Reports Table (Updated to match UI features)
CREATE TABLE IF NOT EXISTS incidents (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    report_subject VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    report_location TEXT NOT NULL,
    report_description TEXT NOT NULL,
    status ENUM('New', 'Forwarded', 'Returned', 'Resolved') DEFAULT 'New',
    dept_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

-- 7. Staff Accounts (From your original script, though users table usually covers this)
CREATE TABLE IF NOT EXISTS staff_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('active', 'locked') DEFAULT 'active'
);

-- ==========================================
-- DUMMY DATA (So your dashboard isn't empty)
-- ==========================================

-- Insert Default Departments
INSERT INTO departments (dept_name) VALUES 
('Traffic Management'), 
('DRRMO'), 
('Engineering & Public Works'),
('Health Department');

-- Insert a Default Main Admin (Password is 'admin123' hashed with bcrypt, though your login script currently bypasses this)
INSERT INTO users (username, email, password, role, status) VALUES 
('Main_Admin', 'admin@beat.gov.ph', '$2y$10$eO7w3Qd.b0nL9XpL/hM2uey.j/oZJgN.u.XqZ3N2QY0xG8Y5mH1XG', 'Main Admin', 'Active');

-- Insert a Staff Admin assigned to Traffic
INSERT INTO users (username, email, password, role, dept_id, status) VALUES 
('Traffic_Staff_1', 'traffic@beat.gov.ph', 'hashedpassword123', 'Staff Admin', 1, 'Active');

-- Insert Sample Reports
INSERT INTO incidents (reporter_name, reporter_email, report_subject, contact_number, report_location, report_description, status, dept_id) VALUES 
('Juan Dela Cruz', 'juan@example.com', 'Heavy Flooding', '09123456789', 'Brgy. Rosario, C5 Southbound', 'Knee-deep flood waters causing severe traffic buildup.', 'Forwarded', 2),
('Maria Clara', 'maria@example.com', 'Broken Traffic Light', '09987654321', 'Ortigas Ave cor. C. Raymundo', 'Traffic light is stuck on red causing confusion and near-accidents.', 'New', NULL),
('Jose Rizal', 'jose@example.com', 'Pothole Issue', '09112223333', 'Pioneer Street', 'Massive pothole forming near the intersection.', 'Resolved', 3);

-- Insert Sample News Article
INSERT INTO news_articles (title, category, content, admin_id) VALUES 
('Scheduled Road Closure for C5 Maintenance', 'Road Work', 'Please be advised that the C5 Northbound lane will be closed this weekend for essential drainage repairs. Expect heavy traffic and take alternate routes.', 1);

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, details) VALUES 
(1, 'System Login', 'Main Admin logged into the system.'),
(1, 'Updated Status', 'Marked Report #3 as Resolved.'),
(2, 'Forwarded Report', 'Assigned Report #1 to DRRMO.');