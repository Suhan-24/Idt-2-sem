/**
 * db.js — File-based JSON persistence (zero external deps).
 * Stores data in ./data/*.json files next to the server directory.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_DATA_DIR = join(__dirname, '..', 'medcare_data');
const DATA_DIR = process.env.VERCEL
  ? join('/tmp', 'medcare_data')
  : BUNDLED_DATA_DIR;

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

if (process.env.VERCEL && existsSync(BUNDLED_DATA_DIR)) {
  for (const name of ['doctors', 'medicines', 'appointments', 'patients']) {
    const src = join(BUNDLED_DATA_DIR, `${name}.json`);
    const dest = join(DATA_DIR, `${name}.json`);
    if (existsSync(src) && !existsSync(dest)) {
      writeFileSync(dest, readFileSync(src, 'utf8'), 'utf8');
    }
  }
}

function filePath(name) {
  return join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  const fp = filePath(name);
  if (!existsSync(fp)) return [];
  try { return JSON.parse(readFileSync(fp, 'utf8')); } catch { return []; }
}

function writeCollection(name, data) {
  writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_DOCTORS = [
  { id:'gp1', name:'Dr. Anil Mehta', dept:'general', qualification:'MBBS, MD (Internal Medicine)', specialization:'General Physician & Diabetologist', experience:15, rating:4.8, reviews:1240, photo:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format', bio:'Dr. Anil Mehta is a renowned General Physician with 15+ years of experience in internal medicine and diabetes management.', languages:['English','Hindi','Kannada'], fee:400, available:true },
  { id:'gp2', name:'Dr. Sunita Rao', dept:'general', qualification:'MBBS, DNB (Family Medicine)', specialization:'Family Physician & Geriatrics', experience:10, rating:4.7, reviews:890, photo:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format', bio:'Dr. Sunita Rao specializes in family medicine with a focus on preventive care.', languages:['English','Kannada','Tulu','Telugu'], fee:350, available:true },
  { id:'gp3', name:'Dr. Rajesh Kumar', dept:'general', qualification:'MBBS, MD', specialization:'General Medicine & Infectious Diseases', experience:12, rating:4.6, reviews:765, photo:'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&auto=format', bio:'Dr. Rajesh Kumar brings 12 years of expertise in treating infectious diseases.', languages:['English','Hindi','Kannada'], fee:380, available:true },
  { id:'card1', name:'Dr. Ramesh Iyer', dept:'cardiology', qualification:'MBBS, MD, DM (Cardiology)', specialization:'Interventional Cardiologist', experience:20, rating:4.9, reviews:2100, photo:'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&auto=format', bio:'Dr. Ramesh Iyer is a leading interventional cardiologist with over 20 years of expertise. He has performed over 5000 angioplasties.', languages:['English','Tamil','Kannada'], fee:900, available:true },
  { id:'card2', name:'Dr. Priya Gupta', dept:'cardiology', qualification:'MBBS, MD, DNB (Cardiology)', specialization:'Non-Invasive Cardiologist', experience:14, rating:4.7, reviews:1380, photo:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format', bio:'Dr. Priya Gupta specializes in echocardiography and non-invasive cardiac imaging.', languages:['English','Hindi'], fee:800, available:true },
  { id:'ortho1', name:'Dr. Sanjay Patel', dept:'orthopedic', qualification:'MBBS, MS (Orthopedics)', specialization:'Joint Replacement & Sports Medicine', experience:18, rating:4.8, reviews:1650, photo:'https://images.unsplash.com/photo-1637059824899-a441006a6875?w=200&h=200&fit=crop&auto=format', bio:'Dr. Sanjay Patel is a renowned orthopedic surgeon specializing in knee and hip replacement.', languages:['English','Gujarati','Hindi'], fee:700, available:true },
  { id:'ortho2', name:'Dr. Lakshmi Narayanan', dept:'orthopedic', qualification:'MBBS, MS, Fellowship (Spine Surgery)', specialization:'Spine & Trauma Surgeon', experience:16, rating:4.7, reviews:1120, photo:'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=200&h=200&fit=crop&auto=format', bio:'Dr. Lakshmi Narayanan is an expert in spinal disorders and trauma surgery.', languages:['English','Tamil','Kannada'], fee:750, available:true },
  { id:'dent1', name:'Dr. Pritha Sen', dept:'dental', qualification:'BDS, MDS (Orthodontics)', specialization:'Orthodontist & Smile Designer', experience:9, rating:4.8, reviews:980, photo:'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&auto=format', bio:'Dr. Pritha Sen is a certified orthodontist who specializes in Invisalign and smile makeovers.', languages:['English','Bengali','Hindi'], fee:500, available:true },
  { id:'dent2', name:"Dr. Mahesh D'Souza", dept:'dental', qualification:'BDS, MDS (Prosthodontics)', specialization:'Prosthodontist & Implantologist', experience:12, rating:4.6, reviews:740, photo:'https://images.unsplash.com/photo-1618798971001-a8c19aa35ba1?w=200&h=200&fit=crop&auto=format', bio:"Dr. Mahesh D'Souza is a leading implantologist from coastal Karnataka.", languages:['English','Kannada','Tulu','Konkani'], fee:600, available:true },
  { id:'neuro1', name:'Dr. Arjun Nair', dept:'neurology', qualification:'MBBS, MD, DM (Neurology)', specialization:'Stroke & Epilepsy Specialist', experience:22, rating:4.9, reviews:1890, photo:'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&h=200&fit=crop&auto=format', bio:'Dr. Arjun Nair is a pioneer in stroke treatment in South India. He has published over 40 research papers.', languages:['English','Malayalam','Hindi'], fee:1100, available:true },
  { id:'neuro2', name:'Dr. Deepa Krishnan', dept:'neurology', qualification:'MBBS, MD, DNB (Neurology)', specialization:'Headache & Movement Disorders', experience:11, rating:4.7, reviews:870, photo:'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&auto=format', bio:"Dr. Deepa Krishnan specializes in migraine management and movement disorders.", languages:['English','Tamil','Telugu','Kannada'], fee:900, available:true },
  { id:'pedia1', name:'Dr. Vijay Kumar', dept:'pediatrics', qualification:'MBBS, MD (Pediatrics), Fellowship (Neonatology)', specialization:'Pediatrician & Neonatologist', experience:16, rating:4.9, reviews:2340, photo:'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=200&h=200&fit=crop&auto=format', bio:'Dr. Vijay Kumar is a beloved pediatrician known for his gentle manner with children.', languages:['English','Hindi','Kannada'], fee:500, available:true },
  { id:'pedia2', name:'Dr. Ananya Sharma', dept:'pediatrics', qualification:'MBBS, DNB (Pediatrics)', specialization:'Pediatric Allergist & Pulmonologist', experience:9, rating:4.7, reviews:1050, photo:'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=200&fit=crop&auto=format', bio:'Dr. Ananya Sharma specializes in childhood asthma, allergies, and respiratory conditions.', languages:['English','Hindi','Bengali'], fee:450, available:true },
];

const SEED_MEDICINES = [
  { id:'med1', name:'Paracetamol 500mg', category:'Pain Relief', price:12.5, stock:500, description:'Effective pain reliever and fever reducer.', prescription_required:false },
  { id:'med2', name:'Metformin 500mg', category:'Diabetes', price:45.0, stock:300, description:'First-line medication for type 2 diabetes.', prescription_required:true },
  { id:'med3', name:'Atorvastatin 10mg', category:'Cardiology', price:85.0, stock:200, description:'Statin for lowering cholesterol and triglycerides.', prescription_required:true },
  { id:'med4', name:'Cetirizine 10mg', category:'Allergy', price:18.0, stock:400, description:'Antihistamine for allergy and hay fever symptoms.', prescription_required:false },
  { id:'med5', name:'Omeprazole 20mg', category:'Gastrology', price:32.0, stock:350, description:'Proton pump inhibitor for acid reflux and ulcers.', prescription_required:false },
  { id:'med6', name:'Amoxicillin 250mg', category:'Antibiotic', price:55.0, stock:150, description:'Broad-spectrum antibiotic for bacterial infections.', prescription_required:true },
  { id:'med7', name:'Aspirin 75mg', category:'Cardiology', price:9.0, stock:600, description:'Low-dose aspirin for heart attack and stroke prevention.', prescription_required:false },
  { id:'med8', name:'Azithromycin 500mg', category:'Antibiotic', price:95.0, stock:120, description:'Used for respiratory tract and skin infections.', prescription_required:true },
  { id:'med9', name:'Vitamin D3 60000IU', category:'Vitamins', price:40.0, stock:250, description:'Vitamin D supplement for bone health and immunity.', prescription_required:false },
  { id:'med10', name:'Pantoprazole 40mg', category:'Gastrology', price:28.0, stock:300, description:'Reduces stomach acid production for GERD treatment.', prescription_required:false },
];

const SEED_APPOINTMENTS = [
  { id:'demo1', patientName:'Demo Patient', patientPhone:'9876543210', doctorId:'card1', doctorName:'Dr. Ramesh Iyer', doctorDept:'cardiology', date:'2026-06-20', slot:'10:00 AM', reason:'Chest pain follow-up', status:'upcoming', createdAt:new Date().toISOString() },
  { id:'demo2', patientName:'Demo Patient', patientPhone:'9876543210', doctorId:'gp1', doctorName:'Dr. Anil Mehta', doctorDept:'general', date:'2026-05-10', slot:'9:00 AM', reason:'Routine check-up', status:'completed', createdAt:new Date().toISOString() },
];

const SEED_PATIENTS = [
  { id:'pat1', name:'Demo Patient', phone:'9876543210', email:'demo@medcare.in', dob:'1990-01-15', blood_group:'O+', created_at:new Date().toISOString() },
];

// ─── Initialize collections (seed if empty) ────────────────────────────────

function initCollection(name, seed) {
  const existing = readCollection(name);
  if (existing.length === 0) {
    writeCollection(name, seed);
    console.log(`✅ Seeded ${seed.length} ${name}`);
    return seed;
  }
  return existing;
}

initCollection('doctors', SEED_DOCTORS);
initCollection('medicines', SEED_MEDICINES);
initCollection('appointments', SEED_APPOINTMENTS);
initCollection('patients', SEED_PATIENTS);

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export const db = {
  // Generic find
  find(collection, predicate) {
    return readCollection(collection).filter(predicate || (() => true));
  },
  findOne(collection, predicate) {
    return readCollection(collection).find(predicate);
  },
  insert(collection, doc) {
    const data = readCollection(collection);
    const newDoc = { id: randomUUID(), createdAt: new Date().toISOString(), ...doc };
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc;
  },
  update(collection, id, updates) {
    const data = readCollection(collection);
    const idx = data.findIndex(d => d.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates };
    writeCollection(collection, data);
    return data[idx];
  },
  delete(collection, id) {
    const data = readCollection(collection);
    const idx = data.findIndex(d => d.id === id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    writeCollection(collection, data);
    return true;
  },
};

export default db;
