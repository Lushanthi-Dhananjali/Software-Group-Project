import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
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
  INITIAL_FEEDBACKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ASSIGNMENT_SUBMISSIONS
} from '../src/data/mockData';

dotenv.config();

const mongoUri = process.env.MONGODB_URI?.trim();
const mongoDatabaseName = process.env.MONGODB_DB_NAME || 'physics_lms';
const FILE_DB_PATH = path.resolve(process.cwd(), 'lms_database.json');

let client: MongoClient | null = null;
let database: Db | null = null;
let isMongoConnected = false;

const initialSettings = [
  { id: 'home_sections', hero: true, classes: true, timeline: true, announcements: true, contact: true },
  {
    id: 'home_content',
    heroTitleEn: 'Master A/L Physics with Precision',
    heroTitleSi: 'නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න',
    heroSubtitleEn: "Sri Lanka's premium educational portal led by expert pedagogy.",
    heroSubtitleSi: 'සිද්ධාන්ත, පුනරීක්ෂණ සහ ප්‍රශ්න පත්‍ර පන්ති සජීවීව මෙහෙයවන අධ්‍යාපන පද්ධතිය.',
    heroVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    milestones: [],
    helplinePhone: '+94 11 259 8810',
    helplineWhatsapp: '+94 77 123 4567',
    helplineHours: 'Every Day: 8:00 AM - 8:00 PM',
    centers: [],
    bankProtocolEn: 'Upload a clear image of your stamped bank deposit slip to activate your class.',
    bankProtocolSi: 'පන්තිය සක්‍රිය කිරීමට මුද්‍රා සහිත බැංකු තැන්පතු පත්‍රිකාවේ පැහැදිලි ඡායාරූපයක් ඉදිරිපත් කරන්න.'
  }
];

const seedData: Record<string, any[]> = {
  users: INITIAL_USERS,
  classes: INITIAL_CLASSES,
  recordings: INITIAL_RECORDINGS,
  materials: INITIAL_STUDY_MATERIALS,
  exams: INITIAL_EXAMS,
  examPapers: [],
  paperSubmissions: [],
  forums: INITIAL_FORUMS,
  slips: INITIAL_SLIPS,
  announcements: INITIAL_ANNOUNCEMENTS,
  chats: INITIAL_CHATS,
  feedbacks: INITIAL_FEEDBACKS,
  attempts: [],
  assignments: INITIAL_ASSIGNMENTS,
  assignmentSubmissions: INITIAL_ASSIGNMENT_SUBMISSIONS,
  settings: initialSettings
};

function initLocalFileDb() {
  if (!fs.existsSync(FILE_DB_PATH)) {
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(seedData, null, 2), 'utf8');
  } else {
    try {
      const raw = fs.readFileSync(FILE_DB_PATH, 'utf8');
      const data = JSON.parse(raw);
      let updated = false;
      for (const [key, value] of Object.entries(seedData)) {
        if (!data[key]) {
          data[key] = value;
          updated = true;
        }
      }
      if (updated) {
        fs.writeFileSync(FILE_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch {
      fs.writeFileSync(FILE_DB_PATH, JSON.stringify(seedData, null, 2), 'utf8');
    }
  }
}

function readLocalDb(): Record<string, any[]> {
  try {
    if (!fs.existsSync(FILE_DB_PATH)) {
      initLocalFileDb();
    }
    const raw = fs.readFileSync(FILE_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local file database:', err);
    return { ...seedData };
  }
}

function writeLocalDb(data: Record<string, any[]>) {
  try {
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local file database:', err);
    throw err;
  }
}

export async function initDatabase() {
  if (mongoUri) {
    try {
      client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000
      });
      await client.connect();
      database = client.db(mongoDatabaseName);
      await database.command({ ping: 1 });
      isMongoConnected = true;
      console.log(`MongoDB connected: ${mongoDatabaseName}`);
      await seedMongoIfEmpty();
      return;
    } catch (error) {
      await client?.close().catch(() => undefined);
      client = null;
      database = null;
      isMongoConnected = false;
      console.warn(`MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}. Falling back to local file database.`);
    }
  } else {
    console.log('MONGODB_URI not provided. Using local JSON database (lms_database.json).');
  }

  // Fallback to local file database
  initLocalFileDb();
}

async function seedMongoIfEmpty() {
  if (!database) return;

  for (const [collectionName, items] of Object.entries(seedData)) {
    const collection = database.collection(collectionName);
    if (await collection.countDocuments() === 0 && items.length > 0) {
      await collection.insertMany(items.map((item) => ({ ...item, _id: item.id })));
    }
  }
}

function withoutMongoId(document: any) {
  if (!document) return document;
  const { _id, ...data } = document;
  return data;
}

export async function getLMSData() {
  if (isMongoConnected && database) {
    try {
      const result: Record<string, any[]> = {};
      for (const collectionName of Object.keys(seedData)) {
        const documents = await database.collection(collectionName).find({}).toArray();
        result[collectionName] = documents.map(withoutMongoId);
      }
      return result;
    } catch (err) {
      console.error('Failed to get LMS data from MongoDB, falling back to local file:', err);
    }
  }

  return readLocalDb();
}

export async function saveItem(collectionName: string, id: string, data: any) {
  if (isMongoConnected && database) {
    try {
      await database.collection<any>(collectionName).replaceOne(
        { _id: id },
        { ...data, _id: id },
        { upsert: true }
      );
      return { success: true };
    } catch (err) {
      console.error(`Failed to save item to MongoDB (${collectionName}):`, err);
    }
  }

  const dbData = readLocalDb();
  if (!dbData[collectionName]) {
    dbData[collectionName] = [];
  }
  const idx = dbData[collectionName].findIndex((item: any) => item.id === id || item._id === id);
  if (idx !== -1) {
    dbData[collectionName][idx] = { ...data, id };
  } else {
    dbData[collectionName].push({ ...data, id });
  }
  writeLocalDb(dbData);
  return { success: true };
}

export async function deleteItem(collectionName: string, id: string) {
  if (isMongoConnected && database) {
    try {
      await database.collection<any>(collectionName).deleteOne({ _id: id });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete item from MongoDB (${collectionName}):`, err);
    }
  }

  const dbData = readLocalDb();
  if (dbData[collectionName]) {
    dbData[collectionName] = dbData[collectionName].filter((item: any) => item.id !== id && item._id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

export async function deleteExamPaperWithSubmissions(paperId: string) {
  if (isMongoConnected && database) {
    try {
      const paperResult = await database.collection<any>('examPapers').deleteOne({ _id: paperId });
      if (paperResult.deletedCount === 0) {
        return { deletedPaper: false, deletedSubmissions: 0 };
      }
      const submissionsResult = await database.collection<any>('paperSubmissions').deleteMany({ paperId });
      return { deletedPaper: true, deletedSubmissions: submissionsResult.deletedCount };
    } catch (err) {
      console.error('Failed to delete exam paper from MongoDB:', err);
    }
  }

  const dbData = readLocalDb();
  const initialPapers = dbData.examPapers || [];
  const filteredPapers = initialPapers.filter((p: any) => p.id !== paperId && p._id !== paperId);
  const deletedPaper = filteredPapers.length < initialPapers.length;

  const initialSubmissions = dbData.paperSubmissions || [];
  const filteredSubmissions = initialSubmissions.filter((s: any) => s.paperId !== paperId);
  const deletedSubmissions = initialSubmissions.length - filteredSubmissions.length;

  if (deletedPaper) {
    dbData.examPapers = filteredPapers;
    dbData.paperSubmissions = filteredSubmissions;
    writeLocalDb(dbData);
  }

  return { deletedPaper, deletedSubmissions };
}

export async function deleteAssignmentWithSubmissions(assignmentId: string) {
  if (isMongoConnected && database) {
    try {
      const assignmentResult = await database.collection<any>('assignments').deleteOne({ _id: assignmentId });
      if (assignmentResult.deletedCount === 0) {
        return { deletedAssignment: false, deletedSubmissions: 0 };
      }
      const submissionsResult = await database.collection<any>('assignmentSubmissions').deleteMany({ assignmentId });
      return { deletedAssignment: true, deletedSubmissions: submissionsResult.deletedCount };
    } catch (err) {
      console.error('Failed to delete assignment from MongoDB:', err);
    }
  }

  const dbData = readLocalDb();
  const initialAssignments = dbData.assignments || [];
  const filteredAssignments = initialAssignments.filter((a: any) => a.id !== assignmentId && a._id !== assignmentId);
  const deletedAssignment = filteredAssignments.length < initialAssignments.length;

  const initialSubmissions = dbData.assignmentSubmissions || [];
  const filteredSubmissions = initialSubmissions.filter((s: any) => s.assignmentId !== assignmentId);
  const deletedSubmissions = initialSubmissions.length - filteredSubmissions.length;

  if (deletedAssignment) {
    dbData.assignments = filteredAssignments;
    dbData.assignmentSubmissions = filteredSubmissions;
    writeLocalDb(dbData);
  }

  return { deletedAssignment, deletedSubmissions };
}

export async function getExamAttempts(studentId: string) {
  if (isMongoConnected && database) {
    try {
      const attempts = await database.collection('attempts').find({ studentId }).toArray();
      return attempts.map(withoutMongoId);
    } catch (err) {
      console.error('Failed to get attempts from MongoDB:', err);
    }
  }

  const dbData = readLocalDb();
  const attempts = dbData.attempts || [];
  return attempts.filter((a: any) => a.studentId === studentId);
}

export function getDatabaseStatus() {
  return {
    connected: true,
    provider: isMongoConnected ? 'MongoDB Atlas' : 'Local File JSON Fallback (lms_database.json)',
    databaseName: isMongoConnected ? mongoDatabaseName : 'lms_database.json',
    host: isMongoConnected && mongoUri ? new URL(mongoUri).hostname : 'localhost'
  };
}