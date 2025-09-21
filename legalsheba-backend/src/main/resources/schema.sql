-- Enable foreign key constraints for SQLite
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    f_name VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at VARCHAR(50),
    UNIQUE(email)
);

-- Lawyer profiles table
CREATE TABLE IF NOT EXISTS lawyer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    experience INTEGER,
    location VARCHAR(255),
    court_of_practice VARCHAR(255),
    availability_details TEXT,
    v_hour VARCHAR(255),
    UNIQUE(user_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lawyer_id INTEGER,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY(lawyer_id) REFERENCES lawyer_profiles(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    lawyer_id INTEGER NOT NULL,
    appointment_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    problem_description TEXT,
    notes TEXT,
    FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(lawyer_id) REFERENCES lawyer_profiles(id) ON DELETE CASCADE
);

-- Info hub table
CREATE TABLE IF NOT EXISTS info_hub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL
);
