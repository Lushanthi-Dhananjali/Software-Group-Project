import fs from 'fs';
import path from 'path';
import { MongoClient, Db, ObjectId } from 'mongodb';
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
let reconnectTimer: NodeJS.Timeout | null = null;
let isReconnecting = false;

function markMongoDisconnected(reason?: any) {
  if (isMongoConnected) {
    isMongoConnected = false;
    const msg = reason instanceof Error ? reason.message : String(reason || 'Network timeout');
    console.warn(`⚠️ MongoDB connection lost: ${msg}. Seamlessly switched to local storage (lms_database.json).`);
  }
  scheduleMongoReconnect();
}

function scheduleMongoReconnect() {
  if (reconnectTimer || isReconnecting || !mongoUri) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (isMongoConnected) return;
    isReconnecting = true;
    try {
      if (!client || !database) {
        client = new MongoClient(mongoUri, {
          maxPoolSize: 10,
          minPoolSize: 0,
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 4000,
          socketTimeoutMS: 15000
        });
        await client.connect();
        database = client.db(mongoDatabaseName);
      }
      await database.command({ ping: 1 });
      isMongoConnected = true;
      console.log(`✅ MongoDB connection restored: ${mongoDatabaseName}`);
    } catch (_) {
      // Still unreachable (e.g. temporary DNS or internet drop), try again in 20s
      scheduleMongoReconnect();
    } finally {
      isReconnecting = false;
    }
  }, 20000);
}

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
  initLocalFileDb();

  if (mongoUri) {
    try {
      client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        connectTimeoutMS: 6000,
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 15000
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
      console.warn(`MongoDB initial connection notice: ${error instanceof Error ? error.message : String(error)}. Using local database cache (lms_database.json).`);
      scheduleMongoReconnect();
    }
  } else {
    console.log('MONGODB_URI not provided. Using local JSON database (lms_database.json).');
  }
}

async function seedMongoIfEmpty() {
  if (!database) return;

  try {
    for (const [collectionName, items] of Object.entries(seedData)) {
      const collection = database.collection(collectionName);
      if (await collection.countDocuments() === 0 && items.length > 0) {
        await collection.insertMany(items.map((item) => ({ ...item, _id: item.id })));
      }
    }
  } catch (err) {
    console.warn('MongoDB seed notice:', err instanceof Error ? err.message : String(err));
  }
}

function withoutMongoId(document: any) {
  if (!document) return document;
  const { _id, ...data } = document;
  if (!data.id && _id) {
    data.id = typeof _id === 'object' && _id?.toString ? _id.toString() : String(_id);
  }
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
    } catch (err: any) {
      markMongoDisconnected(err);
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
    } catch (err: any) {
      markMongoDisconnected(err);
    }
  }

  // Always keep local storage updated so fallback is always fresh
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
      const orConditions: any[] = [{ _id: id }, { id }];
      if (typeof id === 'string' && ObjectId.isValid(id) && id.length === 24) {
        try {
          orConditions.push({ _id: new ObjectId(id) });
        } catch (_) {}
      }
      await database.collection<any>(collectionName).deleteOne({ $or: orConditions });
    } catch (err: any) {
      markMongoDisconnected(err);
    }
  }

  // Always keep local storage updated
  const dbData = readLocalDb();
  if (dbData[collectionName]) {
    dbData[collectionName] = dbData[collectionName].filter((item: any) => item.id !== id && item._id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

export async function deleteExamPaperWithSubmissions(paperId: string) {
  let deletedPaper = false;
  let deletedSubmissions = 0;

  if (isMongoConnected && database) {
    try {
      const paperResult = await database.collection<any>('examPapers').deleteOne({ _id: paperId });
      if (paperResult.deletedCount > 0) {
        deletedPaper = true;
      }
      const submissionsResult = await database.collection<any>('paperSubmissions').deleteMany({ paperId });
      deletedSubmissions = submissionsResult.deletedCount;
    } catch (err: any) {
      markMongoDisconnected(err);
    }
  }

  const dbData = readLocalDb();
  const initialPapers = dbData.examPapers || [];
  const filteredPapers = initialPapers.filter((p: any) => p.id !== paperId && p._id !== paperId);
  if (filteredPapers.length < initialPapers.length) {
    deletedPaper = true;
  }

  const initialSubmissions = dbData.paperSubmissions || [];
  const filteredSubmissions = initialSubmissions.filter((s: any) => s.paperId !== paperId);
  const localDeletedSubmissions = initialSubmissions.length - filteredSubmissions.length;
  if (localDeletedSubmissions > deletedSubmissions) {
    deletedSubmissions = localDeletedSubmissions;
  }

  if (deletedPaper) {
    dbData.examPapers = filteredPapers;
    dbData.paperSubmissions = filteredSubmissions;
    writeLocalDb(dbData);
  }

  return { deletedPaper, deletedSubmissions };
}

export async function deleteAssignmentWithSubmissions(assignmentId: string) {
  let deletedAssignment = false;
  let deletedSubmissions = 0;

  if (isMongoConnected && database) {
    try {
      const orConditions: any[] = [{ _id: assignmentId }, { id: assignmentId }];
      if (typeof assignmentId === 'string' && ObjectId.isValid(assignmentId) && assignmentId.length === 24) {
        try {
          orConditions.push({ _id: new ObjectId(assignmentId) });
        } catch (_) {}
      }
      const assignmentResult = await database.collection<any>('assignments').deleteOne({ $or: orConditions });
      if (assignmentResult.deletedCount > 0) {
        deletedAssignment = true;
      }
      const submissionsResult = await database.collection<any>('assignmentSubmissions').deleteMany({
        $or: [{ assignmentId }, { assignment_id: assignmentId }]
      });
      deletedSubmissions = submissionsResult.deletedCount || 0;
    } catch (err: any) {
      markMongoDisconnected(err);
    }
  }

  // Always keep local JSON file database in sync
  try {
    const dbData = readLocalDb();
    const initialAssignments = dbData.assignments || [];
    const filteredAssignments = initialAssignments.filter((a: any) => a.id !== assignmentId && a._id !== assignmentId);
    if (filteredAssignments.length < initialAssignments.length) {
      deletedAssignment = true;
    }

    const initialSubmissions = dbData.assignmentSubmissions || [];
    const filteredSubmissions = initialSubmissions.filter((s: any) => s.assignmentId !== assignmentId);
    const localDeletedSubmissions = initialSubmissions.length - filteredSubmissions.length;
    if (localDeletedSubmissions > deletedSubmissions) {
      deletedSubmissions = localDeletedSubmissions;
    }

    dbData.assignments = filteredAssignments;
    dbData.assignmentSubmissions = filteredSubmissions;
    writeLocalDb(dbData);
  } catch (localErr) {
    console.warn('Failed to update local db after deleting assignment:', localErr);
  }

  return { deletedAssignment: true, deletedSubmissions };
}

export async function getExamAttempts(studentId: string) {
  if (isMongoConnected && database) {
    try {
      const attempts = await database.collection('attempts').find({ studentId }).toArray();
      return attempts.map(withoutMongoId);
    } catch (err: any) {
      markMongoDisconnected(err);
    }
  }

  const dbData = readLocalDb();
  const attempts = dbData.attempts || [];
  return attempts.filter((a: any) => a.studentId === studentId);
}

export function getDatabaseStatus() {
  let hostname = 'localhost';
  try {
    if (mongoUri) {
      const parsed = new URL(mongoUri);
      hostname = parsed.hostname;
    }
  } catch (_) {}

  return {
    connected: true,
    provider: isMongoConnected ? 'MongoDB Atlas' : 'Local File JSON Fallback (lms_database.json)',
    databaseName: isMongoConnected ? mongoDatabaseName : 'lms_database.json',
    host: isMongoConnected ? hostname : 'localhost'
  };
}