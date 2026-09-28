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
  INITIAL_FEEDBACKS
} from '../src/data/mockData';

dotenv.config();

const mongoUri = process.env.MONGODB_URI?.trim();
const mongoDatabaseName = process.env.MONGODB_DB_NAME || 'physics_lms';

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
  forums: INITIAL_FORUMS,
  slips: INITIAL_SLIPS,
  announcements: INITIAL_ANNOUNCEMENTS,
  chats: INITIAL_CHATS,
  feedbacks: INITIAL_FEEDBACKS,
  attempts: [],
  settings: initialSettings
};

export async function initDatabase() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured. Add a valid MongoDB Atlas connection string to .env.');
  }

  try {
    client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    await client.connect();
    database = client.db(mongoDatabaseName);
    await database.command({ ping: 1 });
    isMongoConnected = true;
    console.log(`MongoDB connected: ${mongoDatabaseName}`);
    await seedMongoIfEmpty();
  } catch (error) {
    await client?.close().catch(() => undefined);
    client = null;
    database = null;
    isMongoConnected = false;
    throw new Error(`MongoDB connection failed. Check the Atlas username, password, and network access. ${error instanceof Error ? error.message : String(error)}`);
  }
}

function getDatabase() {
  if (!database || !isMongoConnected) {
    throw new Error('MongoDB is not connected. Check MONGODB_URI in .env.');
  }
  return database;
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
  const result: Record<string, any[]> = {};
  const connectedDatabase = getDatabase();
  for (const collectionName of Object.keys(seedData)) {
    const documents = await connectedDatabase.collection(collectionName).find({}).toArray();
    result[collectionName] = documents.map(withoutMongoId);
  }
  return result;
}

export async function saveItem(collectionName: string, id: string, data: any) {
  const connectedDatabase = getDatabase();
  await connectedDatabase.collection<any>(collectionName).replaceOne(
    { _id: id },
    { ...data, _id: id },
    { upsert: true }
  );
  return { success: true };
}

export async function deleteItem(collectionName: string, id: string) {
  const connectedDatabase = getDatabase();
  await connectedDatabase.collection<any>(collectionName).deleteOne({ _id: id });
  return { success: true };
}

export async function getExamAttempts(studentId: string) {
  const connectedDatabase = getDatabase();
  const attempts = await connectedDatabase.collection('attempts').find({ studentId }).toArray();
  return attempts.map(withoutMongoId);
}

export function getDatabaseStatus() {
  return {
    connected: isMongoConnected,
    provider: 'MongoDB',
    databaseName: mongoDatabaseName,
    host: mongoUri ? new URL(mongoUri).hostname : null
  };
}