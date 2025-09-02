USE `school-app`;

-- Ensure emoji support
ALTER DATABASE `school-app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Skip the ALTER TABLE if column might already exist
-- (Just comment out the problematic line since the column already exists)

-- Create favourites table
CREATE TABLE IF NOT EXISTS favourites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  school_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fav (user_id, school_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS users_set_avatar_initial;

DELIMITER //
CREATE TRIGGER users_set_avatar_initial
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.avatar IS NULL OR NEW.avatar = '' THEN
    SET NEW.avatar = UPPER(LEFT(NEW.username, 1));
  END IF;
END//
DELIMITER ;

-- Seed admin user
INSERT INTO users (username, email, password_hash, role, avatar)
VALUES ('admin', 'admin@schooldashboard.com', '$2b$10$jpuYUeinn5UIoJ.AvXhGX.iSDxZUEGgKmcWA8HlncCtOZLgkh7nei', 'admin', NULL)
ON DUPLICATE KEY UPDATE 
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  avatar = VALUES(avatar);