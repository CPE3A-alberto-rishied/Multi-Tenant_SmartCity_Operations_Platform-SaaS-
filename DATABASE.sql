-- Table for Departments (Managed by Main Admin)

-- 1. Departments Table (Existing)
CREATE TABLE IF NOT EXISTS departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Existing - Updated to link to news)
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

-- Updated News Articles Table with Expanded Categories
CREATE TABLE IF NOT EXISTS news_articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM(
        'Public Welfare', 
        'Urgent Alert', 
        'Health', 
        'Traffic', 
        'Road Work', 
        'Water Service', 
        'Power Interruption',
        'Weather',
        'Security',
        'Community'
    ) DEFAULT 'Public Welfare',
    content TEXT NOT NULL,
    admin_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. NEW: Article Images Table (For Multiple Photo Uploads)
CREATE TABLE IF NOT EXISTS article_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL, -- Stores the file path (e.g., uploads/news/img1.jpg)
    is_featured TINYINT(1) DEFAULT 0, -- 1 = Thumbnail/Preview, 0 = Gallery
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_article_news
        FOREIGN KEY (article_id) 
        REFERENCES news_articles(article_id) 
        ON DELETE CASCADE
);

-- Table for Audit Logs 
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    
);

-- Table for Incident Reports
CREATE TABLE incidents (
    report_id int AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    report_subject VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    report_location TEXT NOT NULL,
    report_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('active', 'locked') DEFAULT 'active'
);