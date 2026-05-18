// Environment guard to prevent fs/path client compilation errors in Next.js
let fs = null;
let path = null;
let dbPath = "";

if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
  dbPath = path.join(process.cwd(), 'database.json');
}

// Memory fallback to ensure absolute zero latency and fast concurrent operations
let dbCache = null;

function loadDb() {
  if (dbCache) return dbCache;
  
  if (typeof window === 'undefined' && fs && dbPath) {
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        dbCache = {
          profiles: [],
          goals: [],
          escalations: [],
          cycles: [],
          audit_logs: [],
          checkins: [],
          feedbacks: []
        };
        dbCache = { ...dbCache, ...JSON.parse(data) };
        return dbCache;
      }
    } catch (error) {
      console.error("Error reading database.json, using fallback cache:", error);
    }
  }
  
  // High-fidelity fallback structure if database.json doesn't exist yet
  dbCache = {
    profiles: [],
    goals: [],
    escalations: [],
    cycles: [],
    audit_logs: [],
    checkins: [],
    feedbacks: [],
    checkin_comments: []
  };
  return dbCache;
}

function saveDb(data) {
  dbCache = data;
  if (typeof window === 'undefined' && fs && dbPath) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing database.json:", error);
    }
  }
}

export function getProfiles() {
  const db = loadDb();
  return db.profiles || [];
}

export function getProfileById(id) {
  const profiles = getProfiles();
  return profiles.find(p => p.id === id) || null;
}

export function getProfileByEmail(email) {
  const profiles = getProfiles();
  return profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
}

export function updateProfile(id, updates) {
  const db = loadDb();
  const index = db.profiles.findIndex(p => p.id === id);
  if (index !== -1) {
    db.profiles[index] = { ...db.profiles[index], ...updates };
    saveDb(db);
    return db.profiles[index];
  }
  return null;
}

export function getGoals(employeeId) {
  const db = loadDb();
  const goals = db.goals || [];
  if (employeeId) {
    return goals.filter(g => g.employee_id === employeeId);
  }
  return goals;
}

export function createGoal(goal) {
  const db = loadDb();
  const newGoal = {
    id: goal.id || `goal-uuid-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...goal
  };
  db.goals.push(newGoal);
  saveDb(db);
  return newGoal;
}

// Check‑ins handling
export function getCheckins(employeeId) {
  const db = loadDb();
  const checkins = db.checkins || [];
  if (employeeId) {
    return checkins.filter(c => c.employee_id === employeeId);
  }
  return checkins;
}

export function createCheckin(checkin) {
  const db = loadDb();
  const newCheckin = {
    id: checkin.id || `checkin-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...checkin
  };
  db.checkins.push(newCheckin);
  saveDb(db);
  return newCheckin;
}

// Check-in comments handling
export function getCheckinComments(managerId) {
  const db = loadDb();
  const comments = db.checkin_comments || [];
  if (managerId) {
    return comments.filter(c => String(c.manager_id) === String(managerId));
  }
  return comments;
}

export function createCheckinComment(comment) {
  const db = loadDb();
  const newComment = {
    id: comment.id || `ccomment-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...comment
  };
  db.checkin_comments.push(newComment);
  saveDb(db);
  return newComment;
}

// Feedback handling
export function getFeedbacks(employeeId) {
  const db = loadDb();
  const feedbacks = db.feedbacks || [];
  if (employeeId) {
    return feedbacks.filter(f => f.employee_id === employeeId);
  }
  return feedbacks;
}

export function createFeedback(feedback) {
  const db = loadDb();
  const newFeedback = {
    id: feedback.id || `feedback-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...feedback
  };
  db.feedbacks.push(newFeedback);
  saveDb(db);
  return newFeedback;
}

export function updateGoal(id, updates) {
  const db = loadDb();
  const index = db.goals.findIndex(g => g.id === id);
  if (index !== -1) {
    db.goals[index] = { ...db.goals[index], ...updates };
    saveDb(db);
    return db.goals[index];
  }
  return null;
}

export function getEscalations() {
  const db = loadDb();
  return db.escalations || [];
}

export function resolveEscalation(id) {
  const db = loadDb();
  const index = db.escalations.findIndex(e => e.id === id);
  if (index !== -1) {
    db.escalations[index].resolved = true;
    saveDb(db);
    return db.escalations[index];
  }
  return null;
}

export function getCycles() {
  const db = loadDb();
  return db.cycles || [];
}

export function getAuditLogs() {
  const db = loadDb();
  return db.audit_logs || [];
}

export function addAuditLog(actor, action, status) {
  const db = loadDb();
  const newLog = {
    id: `audit-uuid-${Date.now()}`,
    time: "Just now",
    actor,
    action,
    status
  };
  db.audit_logs.unshift(newLog); // newest first
  saveDb(db);
  return newLog;
}
