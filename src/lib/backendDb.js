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

function roundWeightage(value) {
  return Math.round(Number(value) * 100) / 100;
}

function coerceWeightage(value) {
  const numericWeightage = Number(value);
  return Number.isFinite(numericWeightage) ? roundWeightage(numericWeightage) : null;
}

function getGoalWeightageTotal(goals, employeeId, excludeGoalId = null) {
  return (goals || []).reduce((sum, goal) => {
    if (String(goal.employee_id) !== String(employeeId)) {
      return sum;
    }

    if (excludeGoalId !== null && String(goal.id) === String(excludeGoalId)) {
      return sum;
    }

    return sum + Number(goal.weightage || 0);
  }, 0);
}

function normalizeGoalWeightages(goals) {
  const byEmployee = new Map();

  (goals || []).forEach((goal) => {
    const employeeKey = String(goal.employee_id || '');
    if (!byEmployee.has(employeeKey)) {
      byEmployee.set(employeeKey, []);
    }
    byEmployee.get(employeeKey).push(goal);
  });

  let changed = false;

  byEmployee.forEach((employeeGoals) => {
    const total = employeeGoals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);

    if (employeeGoals.length > 0 && total > 100.0001) {
      const baseWeightage = Math.floor((100 / employeeGoals.length) * 100) / 100;
      let remainder = roundWeightage(100 - baseWeightage * employeeGoals.length);

      employeeGoals.forEach((goal, index) => {
        const normalizedWeightage = index === employeeGoals.length - 1
          ? roundWeightage(baseWeightage + remainder)
          : baseWeightage;

        if (Number(goal.weightage) !== normalizedWeightage) {
          goal.weightage = normalizedWeightage;
          changed = true;
        }
      });
    }
  });

  return changed;
}

function rebalanceEmployeeGoals(goals, employeeId, excludeGoalId = null, targetTotal = 100) {
  const existing = (goals || []).filter(g => String(g.employee_id) === String(employeeId) && String(g.id) !== String(excludeGoalId));
  const existingTotal = existing.reduce((s, g) => s + Number(g.weightage || 0), 0);

  // Nothing to rebalance or nothing exists
  if (existing.length === 0 || existingTotal <= 0) return false;

  const scale = targetTotal / existingTotal;
  let changed = false;

  // Apply scaled weights with rounding and preserve remainder on last item
  const baseWeights = existing.map(g => Math.floor((g.weightage * scale) * 100) / 100);
  let summed = baseWeights.reduce((s, v) => s + v, 0);
  let remainder = roundWeightage(targetTotal - summed);

  for (let i = 0; i < existing.length; i++) {
    const g = existing[i];
    const newW = i === existing.length - 1 ? roundWeightage(baseWeights[i] + remainder) : baseWeights[i];
    if (Number(g.weightage) !== newW) {
      g.weightage = newW;
      changed = true;
    }
  }

  return changed;
}

function validateGoalWeightage(db, goal, excludeGoalId = null) {
  const employeeId = goal.employee_id;
  if (!employeeId) {
    throw new Error('employee_id is required');
  }

  const weightage = coerceWeightage(goal.weightage);
  if (weightage === null) {
    throw new Error('Weightage must be a number');
  }

  if (weightage <= 0 || weightage > 100) {
    throw new Error('Weightage must be between 1 and 100');
  }

  const currentTotal = getGoalWeightageTotal(db.goals || [], employeeId, excludeGoalId);
  if (currentTotal + weightage > 100.0001) {
    const remaining = roundWeightage(Math.max(0, 100 - currentTotal));
    throw new Error(`Weightage exceeds 100% for this employee. ${remaining}% remaining.`);
  }

  return weightage;
}

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

        if (normalizeGoalWeightages(dbCache.goals)) {
          saveDb(dbCache);
        }

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
  const weightage = validateGoalWeightage(db, goal);
  const newGoal = {
    id: goal.id || `goal-uuid-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...goal,
    weightage
  };
  // If adding this goal would push the employee >100, auto-rebalance existing goals to make room
  const currentTotal = getGoalWeightageTotal(db.goals || [], goal.employee_id, null);
  if (currentTotal + weightage > 100.0001) {
    const remaining = roundWeightage(Math.max(0, 100 - weightage));
    rebalanceEmployeeGoals(db.goals, goal.employee_id, null, remaining);
  }

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
    const nextGoal = { ...db.goals[index], ...updates };

    if (Object.prototype.hasOwnProperty.call(updates, 'weightage')) {
      const validated = validateGoalWeightage(db, nextGoal, id);

      // If increasing this goal would exceed 100, rebalance other goals to make room
      const currentTotalExcluding = getGoalWeightageTotal(db.goals || [], nextGoal.employee_id, id);
      if (currentTotalExcluding + validated > 100.0001) {
        const remaining = roundWeightage(Math.max(0, 100 - validated));
        rebalanceEmployeeGoals(db.goals, nextGoal.employee_id, id, remaining);
      }

      nextGoal.weightage = validated;
    }

    db.goals[index] = nextGoal;
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
