import fs from 'node:fs';
import path from 'node:path';
import { PortalData, Project, Activity, Approval, ApprovalStatus } from '../types.ts';
import { seedData } from './constants.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export function readStore(): PortalData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(seedData, null, 2));
      return seedData;
    }

    const data = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn("Store read failed, using seed data", error);
    return seedData;
  }
}

export function writeStore(data: PortalData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Store write failed", error);
  }
}

export function createProject(input: Omit<Project, 'id'>): Project {
  const store = readStore();
  const id = `p_${Date.now()}`;
  const newProject: Project = { ...input, id };
  
  store.projects.unshift(newProject);
  
  const activity: Activity = {
    id: `act_${Date.now()}`,
    kind: 'file',
    text: `New project '${newProject.name}' created`,
    at: new Date().toISOString()
  };
  store.activity.unshift(activity);
  
  writeStore(store);
  return newProject;
}

export function updateApprovalStatus(id: string, status: ApprovalStatus): Approval {
  const store = readStore();
  const approvalIdx = store.approvals.findIndex(a => a.id === id);
  
  if (approvalIdx === -1) {
    throw new Error('Approval not found');
  }
  
  store.approvals[approvalIdx].status = status;
  
  const activity: Activity = {
    id: `act_${Date.now()}`,
    kind: 'approval',
    text: `Approval '${store.approvals[approvalIdx].title}' marked as ${status}`,
    at: new Date().toISOString()
  };
  store.activity.unshift(activity);
  
  writeStore(store);
  return store.approvals[approvalIdx];
}
