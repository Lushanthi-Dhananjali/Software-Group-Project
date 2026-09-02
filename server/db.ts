import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_RECORDINGS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_EXAMS,
  INITIAL_FORUMS,
  INITIAL_SLIPS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CHATS,
  INITIAL_FEEDBACKS
} from '../src/data/mockData';

dotenv.config();

const FILE_DB_PATH = path.join(process.cwd(), 'lms_database.json');

let pool: mysql.Pool | null = null;
let isMySqlConnected = false;

// Initialize Database connection and tables
export async function initDatabase() {
  const host = process.env.DB_HOST || 'sdb-74.hosting.stackcp.net';
  const user = process.env.DB_USER || 'physics_lms-35303635ec47';
  const password = process.env.DB_PASSWORD || 'K?ZivH/{YIgG';
  const database = process.env.DB_NAME || 'physics_lms-35303635ec47';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  if (host && user && database) {
    console.log(`Connecting to MySQL database at ${host}:${port}/${database}...`);
    try {
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });

      // Test connection
      const conn = await pool.getConnection();
      console.log('MySQL connection established successfully.');
      conn.release();
      isMySqlConnected = true;

      // Create Tables
      await createMySqlTables();
      
      // Seed Database if empty
      await seedMySqlIfEmpty();

    } catch (err) {
      console.error('MySQL connection failed. Falling back to local file database.', err);
      isMySqlConnected = false;
      pool = null;
      await initFileDatabase();
    }
  } else {
    console.log('No MySQL configuration found in environment variables. Using local file database.');
    isMySqlConnected = false;
    await initFileDatabase();
  }
}

// Create MySQL tables if not exist
async function createMySqlTables() {
  if (!pool) return;
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, email VARCHAR(255) NOT NULL, data LONGTEXT NOT NULL, INDEX (email)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS classes (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS recordings (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS materials (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS exams (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS attempts (id VARCHAR(255) PRIMARY KEY, student_id VARCHAR(255) NOT NULL, data LONGTEXT NOT NULL, INDEX (student_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS forums (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS slips (id VARCHAR(255) PRIMARY KEY, student_id VARCHAR(255) NOT NULL, data LONGTEXT NOT NULL, INDEX (student_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS announcements (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS chats (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS feedbacks (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS settings (id VARCHAR(255) PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const sql of tables) {
    await pool.query(sql);
  }
}

// Seed MySQL tables if they are empty
async function seedMySqlIfEmpty() {
  if (!pool) return;

  const seeds = [
    { table: 'users', data: INITIAL_USERS, isUser: true },
    { table: 'classes', data: INITIAL_CLASSES },
    { table: 'recordings', data: INITIAL_RECORDINGS },
    { table: 'materials', data: INITIAL_STUDY_MATERIALS },
    { table: 'exams', data: INITIAL_EXAMS },
    { table: 'forums', data: INITIAL_FORUMS },
    { table: 'slips', data: INITIAL_SLIPS },
    { table: 'announcements', data: INITIAL_ANNOUNCEMENTS },
    { table: 'chats', data: INITIAL_CHATS },
    { table: 'feedbacks', data: INITIAL_FEEDBACKS },
    {
      table: 'settings',
      data: [
        {
          id: 'home_sections',
          hero: true,
          classes: true,
          timeline: true,
          announcements: true,
          contact: true
        },
        {
          id: 'home_content',
          heroTitleEn: "Master A/L Physics with Precision",
          heroTitleSi: "නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න",
          heroSubtitleEn: "Sri Lanka's premium educational portal led by expert pedagogy, offering theory modules, revision clinics, and live paper grading.",
          heroSubtitleSi: "සිද්ධාන්ත, පුනරීක්ෂණ සහ ප්‍රශ්න පත්‍ර පන්ති සජීවීව මෙහෙයවන ශ්‍රී ලංකාවේ ප්‍රමුඛතම භෞතික විද්‍යා අධ්‍යාපන පද්ධතිය.",
          heroVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          milestones: [
            { phase: "Phase 01", titleEn: "Classical Newtonian Mechanics", titleSi: "යාන්ත්‍ර විද්‍යාව මූලික සිද්ධාන්ත", months: "June - Sept", topics: "Vectors, Circular Motion, Friction Equilibrium, Energy laws" },
            { phase: "Phase 02", titleEn: "Oscillations & Waves Resonance", titleSi: "තරංග සහ කම්පන විශ්ලේෂණය", months: "Oct - Dec", topics: "Acoustic physics, Doppler effect, Resonance columns, Light reflection" },
            { phase: "Phase 03", titleEn: "Thermal & Fields Dynamics", titleSi: "තාපය සහ ක්ෂේත්‍ර නියම", months: "Jan - April", topics: "Kinetic theory, Gas laws, Electrostatics, Gravitational grids" },
            { phase: "Phase 04", titleEn: "Electronics & Revision Masterclass", titleSi: "ඉලෙක්ට්‍රොනික විද්‍යාව සහ ප්‍රශ්න පත්‍ර", months: "May - August", topics: "Logic gates, Transistors, OP-AMPS, Past 20 A/L Paper Clinics" }
          ],
          helplinePhone: "+94 11 259 8810",
          helplineWhatsapp: "+94 77 123 4567",
          helplineHours: "Every Day: 8:00 AM - 8:00 PM",
          centers: [
            { name: "Colombo Physical Auditorium", address: "Nugegoda Hall complex, Sri Lanka" },
            { name: "Gampaha Main Lecture Theater", address: "Yakkala Road physical branch" }
          ],
          bankProtocolEn: "Students depositing fees via direct physical bank cash deposits should take a clear unblurred photo of the stamped slip, register an account, and upload it inside their Payment panel to unlock.",
          bankProtocolSi: "සෘජුවම බැංකු තැන්පතු මඟින් ගාස්තු ගෙවන සිසුන්, එම පැහැදිලි තැන්පතු පත්‍රිකාව ඡායාරූපගත කර, ගිණුමක් සාදා, පන්ති සක්‍රීය කර ගැනීමට ඔවුන්ගේ ගෙවීම් අංශය (Payment panel) තුලින් ඉදිරිපත් කළ යුතුය.",
          heroWelcomeTitleEn: "Sandun K. Dissanayaka",
          heroWelcomeTitleSi: "සඳුන් කේ. දිසානායක",
          heroTaglineEn: "The lovely commentator in cyberspace who teaches psychology to the heart",
          heroTaglineSi: "හදවතට Physics කියාදෙන cyber අවකාශයේ සොඳුරු විචාරකයා"
        }
      ]
    }
  ];

  for (const seed of seeds) {
    const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM ??`, [seed.table]);
    if (rows[0].count === 0) {
      console.log(`Seeding empty MySQL table: ${seed.table}...`);
      for (const item of seed.data) {
        if (seed.isUser) {
          const userObj = item as any;
          await pool.query(
            `INSERT INTO users (id, email, data) VALUES (?, ?, ?)`,
            [userObj.id, userObj.email, JSON.stringify(userObj)]
          );
        } else {
          await pool.query(
            `INSERT INTO ?? (id, data) VALUES (?, ?)`,
            [seed.table, item.id, JSON.stringify(item)]
          );
        }
      }
    }
  }
}

// File Database System
async function initFileDatabase() {
  if (!fs.existsSync(FILE_DB_PATH)) {
    console.log('Generating initial local file database with mock data seeds...');
    const initialDb = {
      users: INITIAL_USERS,
      classes: INITIAL_CLASSES,
      recordings: INITIAL_RECORDINGS,
      materials: INITIAL_STUDY_MATERIALS,
      exams: INITIAL_EXAMS,
      forums: INITIAL_FORUMS,
      slips: INITIAL_SLIPS,
      announcements: INITIAL_ANNOUNCEMENTS,
      chats: INITIAL_CHATS,
      feedbacks: INITIAL_FEEDBACKS,
      attempts: [],
      settings: [
        {
          id: 'home_sections',
          hero: true,
          classes: true,
          timeline: true,
          announcements: true,
          contact: true
        },
        {
          id: 'home_content',
          heroTitleEn: "Master A/L Physics with Precision",
          heroTitleSi: "නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න",
          heroSubtitleEn: "Sri Lanka's premium educational portal led by expert pedagogy, offering theory modules, revision clinics, and live paper grading.",
          heroSubtitleSi: "සිද්ධාන්ත, පුනරීක්ෂණ සහ ප්‍රශ්න පත්‍ර පන්ති සජීවීව මෙහෙයවන ශ්‍රී ලංකාවේ ප්‍රමුඛතම භෞතික විද්‍යා අධ්‍යාපන පද්ධතිය.",
          heroVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          milestones: [
            { phase: "Phase 01", titleEn: "Classical Newtonian Mechanics", titleSi: "යාන්ත්‍ර විද්‍යාව මූලික සිද්ධාන්ත", months: "June - Sept", topics: "Vectors, Circular Motion, Friction Equilibrium, Energy laws" },
            { phase: "Phase 02", titleEn: "Oscillations & Waves Resonance", titleSi: "तरंग तरंग तरंग", months: "Oct - Dec", topics: "Acoustic physics, Doppler effect, Resonance columns, Light reflection" },
            { phase: "Phase 03", titleEn: "Thermal & Fields Dynamics", titleSi: "තාපය සහ ක්ෂේත්‍ර නියම", months: "Jan - April", topics: "Kinetic theory, Gas laws, Electrostatics, Gravitational grids" },
            { phase: "Phase 04", titleEn: "Electronics & Revision Masterclass", titleSi: "ඉලෙක්ට්‍රොනික විද්‍යාව සහ ප්‍රශ්න පත්‍ර", months: "May - August", topics: "Logic gates, Transistors, OP-AMPS, Past 20 A/L Paper Clinics" }
          ],
          helplinePhone: "+94 11 259 8810",
          helplineWhatsapp: "+94 77 123 4567",
          helplineHours: "Every Day: 8:00 AM - 8:00 PM",
          centers: [
            { name: "Colombo Physical Auditorium", address: "Nugegoda Hall complex, Sri Lanka" },
            { name: "Gampaha Main Lecture Theater", address: "Yakkala Road physical branch" }
          ],
          bankProtocolEn: "Students depositing fees via direct physical bank cash deposits should take a clear unblurred photo of the stamped slip, register an account, and upload it inside their Payment panel to unlock.",
          bankProtocolSi: "සෘජුවම බැංකු තැන්පතු මඟින් ගාස්තු ගෙවන සිසුන්, එම පැහැදිලි තැන්පතු පත්‍රිකාව ඡායාරූපගත කර, ගිණුමක් සාදා, පන්ති සක්‍රීය කර ගැනීමට ඔවුන්ගේ ගෙවීම් අංශය (Payment panel) තුලින් ඉදිරිපත් කළ යුතුය.",
          heroWelcomeTitleEn: "Sandun K. Dissanayaka",
          heroWelcomeTitleSi: "සඳුන් කේ. දිසානායක",
          heroTaglineEn: "The lovely commentator in cyberspace who teaches psychology to the heart",
          heroTaglineSi: "හදවතට Physics කියාදෙන cyber අවකාශයේ සොඳුරු විචාරකයා"
        }
      ]
    };
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
  }
}

// Fetch all LMS Data at once
export async function getLMSData() {
  if (isMySqlConnected && pool) {
    try {
      const collections = [
        'users', 'classes', 'recordings', 'materials', 'exams',
        'forums', 'slips', 'announcements', 'chats', 'feedbacks', 'settings'
      ];

      const result: any = {};
      for (const table of collections) {
        const [rows]: any = await pool.query(`SELECT data FROM ??`, [table]);
        result[table] = rows.map((r: any) => JSON.parse(r.data));
      }
      return result;
    } catch (err) {
      console.error('Failed to fetch from MySQL, using file fallback', err);
    }
  }

  // File fallback
  try {
    const raw = fs.readFileSync(FILE_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading file database', err);
    return {};
  }
}

// Save an item to database
export async function saveItem(table: string, id: string, data: any) {
  if (isMySqlConnected && pool) {
    try {
      if (table === 'users') {
        const email = data.email || '';
        await pool.query(
          `INSERT INTO users (id, email, data) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE email = VALUES(email), data = VALUES(data)`,
          [id, email, JSON.stringify(data)]
        );
      } else if (table === 'attempts' || table === 'slips') {
        const studentId = data.studentId || '';
        await pool.query(
          `INSERT INTO ?? (id, student_id, data) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), data = VALUES(data)`,
          [table, id, studentId, JSON.stringify(data)]
        );
      } else {
        await pool.query(
          `INSERT INTO ?? (id, data) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE data = VALUES(data)`,
          [table, id, JSON.stringify(data)]
        );
      }
      return { success: true };
    } catch (err) {
      console.error(`MySQL save failed for ${table}:`, err);
    }
  }

  // File Fallback
  try {
    const dbData = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    if (!dbData[table]) {
      dbData[table] = [];
    }
    const idx = dbData[table].findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      dbData[table][idx] = data;
    } else {
      dbData[table].push(data);
    }
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    console.error(`File save failed for ${table}:`, err);
    throw err;
  }
}

// Delete an item from database
export async function deleteItem(table: string, id: string) {
  if (isMySqlConnected && pool) {
    try {
      await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
      return { success: true };
    } catch (err) {
      console.error(`MySQL delete failed for ${table}:`, err);
    }
  }

  // File Fallback
  try {
    const dbData = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    if (dbData[table]) {
      dbData[table] = dbData[table].filter((item: any) => item.id !== id);
      fs.writeFileSync(FILE_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    }
    return { success: true };
  } catch (err) {
    console.error(`File delete failed for ${table}:`, err);
    throw err;
  }
}

// Fetch exam attempts for a specific student
export async function getExamAttempts(studentId: string) {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(
        `SELECT data FROM attempts WHERE student_id = ?`,
        [studentId]
      );
      return rows.map((r: any) => JSON.parse(r.data));
    } catch (err) {
      console.error('MySQL getExamAttempts failed:', err);
    }
  }

  // File Fallback
  try {
    const dbData = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    const attempts = dbData.attempts || [];
    return attempts.filter((a: any) => a.studentId === studentId);
  } catch (err) {
    return [];
  }
}

// Get live database connection status
export function getMySqlStatus() {
  return {
    connected: isMySqlConnected,
    provider: isMySqlConnected ? 'MySQL' : 'Local File JSON Fallback',
    databaseName: process.env.DB_NAME || 'physics_lms-353036310fd3',
    host: process.env.DB_HOST || null
  };
}
