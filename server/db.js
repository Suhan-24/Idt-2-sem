import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'medcare.db');

let dbInstance;

export async function connectDB() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`Connected to SQLite database at ${dbPath}`);

    // Initialize tables
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT,
        dept TEXT,
        qualification TEXT,
        specialization TEXT,
        experience INTEGER,
        rating REAL,
        reviews INTEGER,
        photo TEXT,
        bio TEXT,
        languages TEXT, -- JSON array
        fee INTEGER,
        available INTEGER -- 0 or 1
      );
      
      CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER,
        description TEXT,
        prescription_required INTEGER -- 0 or 1
      );
      
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patientName TEXT,
        patientPhone TEXT,
        doctorId TEXT,
        doctorName TEXT,
        doctorDept TEXT,
        date TEXT,
        slot TEXT,
        reason TEXT,
        status TEXT,
        createdAt TEXT
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        address TEXT,
        pin TEXT,
        items TEXT, -- JSON string
        total REAL,
        status TEXT,
        created_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS video_consultations (
        id TEXT PRIMARY KEY,
        doctor_name TEXT,
        department TEXT,
        date TEXT,
        slot TEXT,
        upi_id TEXT,
        status TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS emergencies (
        id TEXT PRIMARY KEY,
        location TEXT,
        driver_id TEXT,
        driver_name TEXT,
        status TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        email TEXT,
        dob TEXT,
        blood_group TEXT,
        created_at TEXT
      );
    `);
  }
  return dbInstance;
}

// Automatically connect when module is imported
connectDB().catch(console.error);

export default {
  async getDB() {
    return connectDB();
  }
};
