// Environment guard to prevent fs/path client compilation errors in Next.js
let fs = null;
let path = null;
let dbPath = "";

if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
  dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.json');
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

function parseDateValue(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getActiveCycleRecord(db = loadDb()) {
  return (db.cycles || []).find((cycle) => cycle.is_active) || null;
}

function getCurrentQuarterLabel(cycle) {
  if (!cycle) {
    return `Q${Math.floor(new Date().getMonth() / 3) + 1}`;
  }

  const nameMatch = String(cycle.name || '').match(/Q([1-4])/i);
  if (nameMatch) {
    return `Q${nameMatch[1]}`;
  }

  const startDate = parseDateValue(cycle.start_date);
  return startDate ? `Q${Math.floor(startDate.getMonth() / 3) + 1}` : `Q${Math.floor(new Date().getMonth() / 3) + 1}`;
}

function isCycleWindowOpen(cycle, now = new Date()) {
  if (!cycle) {
    return false;
  }

  const startDate = parseDateValue(cycle.start_date);
  const endDate = parseDateValue(cycle.end_date);
  if (!startDate || !endDate) {
    return Boolean(cycle.is_active);
  }

  return Boolean(cycle.is_active) && now >= startDate && now <= endDate;
}

function getEmployeeGoalCount(goals, employeeId, cycleId = null) {
  return (goals || []).filter((goal) => {
    if (String(goal.employee_id) !== String(employeeId)) {
      return false;
    }

    if (cycleId && String(goal.cycle_id || '') !== String(cycleId)) {
      return false;
    }

    return true;
  }).length;
}

function getEmployeeGoalWeightageTotal(goals, employeeId, cycleId = null, excludeGoalId = null) {
  return (goals || []).reduce((sum, goal) => {
    if (String(goal.employee_id) !== String(employeeId)) {
      return sum;
    }

    if (cycleId && String(goal.cycle_id || '') !== String(cycleId)) {
      return sum;
    }

    if (excludeGoalId !== null && String(goal.id) === String(excludeGoalId)) {
      return sum;
    }

    return sum + Number(goal.weightage || 0);
  }, 0);
}

function clampScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function computeAchievementScore(goal, achievementInput = {}) {
  if (achievementInput.computed_score !== undefined && achievementInput.computed_score !== null) {
    return clampScore(achievementInput.computed_score);
  }

  const status = String(achievementInput.progress_status || '').toLowerCase();
  if (status === 'completed' || status === 'done') {
    return 100;
  }
  if (status === 'on_track') {
    return 75;
  }
  if (status === 'at_risk') {
    return 50;
  }
  if (status === 'blocked') {
    return 25;
  }

  const actualValue = Number(achievementInput.actual_value);
  const plannedValue = Number(achievementInput.planned_value);
  if (Number.isFinite(actualValue) && Number.isFinite(plannedValue) && plannedValue !== 0) {
    const uom = String(goal.uom || '').toLowerCase();
    let ratio = actualValue / plannedValue;

    if (uom === 'nx') {
      ratio = plannedValue / Math.max(actualValue, 1);
    } else if (uom === 'tl') {
      ratio = actualValue <= plannedValue ? 1 : plannedValue / actualValue;
    } else if (uom === 'z') {
      ratio = actualValue === 0 ? 1 : Math.max(0, 1 - (actualValue / plannedValue));
    }

    return clampScore(ratio * 100);
  }

  return 0;
}

function buildAchievement(goal, achievementInput = {}) {
  const cycle = achievementInput.cycle || getActiveCycleRecord();
  const quarter = achievementInput.quarter || getCurrentQuarterLabel(cycle);
  const computedScore = computeAchievementScore(goal, achievementInput);

  return {
    id: achievementInput.id || `achievement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    goal_id: goal.id,
    cycle_id: achievementInput.cycle_id || cycle?.id || goal.cycle_id || null,
    quarter,
    planned_value: achievementInput.planned_value ?? null,
    actual_value: achievementInput.actual_value ?? null,
    progress_status: achievementInput.progress_status || (computedScore >= 90 ? 'completed' : computedScore >= 70 ? 'on_track' : computedScore >= 40 ? 'at_risk' : 'blocked'),
    computed_score: computedScore,
    note: achievementInput.note || '',
    submitted_at: achievementInput.submitted_at || new Date().toISOString()
  };
}

function attachAchievement(goal, achievement) {
  const nextAchievements = Array.isArray(goal.achievements) ? [...goal.achievements] : [];
  nextAchievements.unshift(achievement);
  return nextAchievements;
}

function goalSheetReadiness(goals, employeeId, cycleId = null) {
  const employeeGoals = (goals || []).filter((goal) => {
    if (String(goal.employee_id) !== String(employeeId)) {
      return false;
    }

    if (cycleId && String(goal.cycle_id || '') !== String(cycleId)) {
      return false;
    }

    return true;
  });

  const totalWeightage = employeeGoals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const errors = [];

  if (employeeGoals.length > 8) {
    errors.push('Maximum 8 goals allowed per employee');
  }

  if (employeeGoals.some((goal) => Number(goal.weightage || 0) < 10)) {
    errors.push('Each goal must be at least 10% weightage');
  }

  if (Math.abs(totalWeightage - 100) > 0.01) {
    errors.push('Goal sheet must total exactly 100%');
  }

  return {
    ready: errors.length === 0,
    errors,
    totalWeightage,
    goalCount: employeeGoals.length
  };
}

function raiseRuleEscalation(db, escalation) {
  const nextEscalation = {
    id: escalation.id || `escalation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: escalation.created_at || new Date().toISOString(),
    resolved: Boolean(escalation.resolved),
    source: escalation.source || 'rule',
    rule_key: escalation.rule_key,
    ...escalation
  };

  const index = (db.escalations || []).findIndex((entry) => entry.rule_key && entry.rule_key === nextEscalation.rule_key);
  if (index !== -1) {
    db.escalations[index] = {
      ...db.escalations[index],
      ...nextEscalation,
      resolved: false
    };
    return db.escalations[index];
  }

  db.escalations.unshift(nextEscalation);
  return nextEscalation;
}

function refreshRuleBasedEscalations(db) {
  if (!db || !Array.isArray(db.profiles)) {
    return;
  }

  const activeCycle = getActiveCycleRecord(db);
  const now = new Date();
  const seenRuleKeys = new Set();
  const employees = db.profiles.filter((profile) => profile.role === 'employee');

  // Load escalation rules with safety defaults
  const rules = db.escalation_rules || {
    goal_submission_days: 10,
    manager_approval_days: 7,
    checkin_completion_days: 15,
    chain_intervals_days: 5
  };

  employees.forEach((employee) => {
    const employeeGoals = (db.goals || []).filter((goal) => String(goal.employee_id) === String(employee.id));
    const cycleGoals = activeCycle ? employeeGoals.filter((goal) => String(goal.cycle_id || '') === String(activeCycle.id)) : employeeGoals;
    
    // Check-in completion check
    const hasCheckin = (db.checkins || []).some(
      (checkin) => String(checkin.employee_id) === String(employee.id) && 
      (!activeCycle || String(checkin.cycle_id || '') === String(activeCycle.id))
    );

    if (activeCycle) {
      const cycleStart = parseDateValue(activeCycle.start_date);
      const daysSinceStart = cycleStart ? Math.max(0, Math.ceil((now.getTime() - cycleStart.getTime()) / 86400000)) : 0;

      // 1. Employee Goal Submission check
      const totalWeightage = cycleGoals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);
      const hasDraftsOrEmpty = cycleGoals.length === 0 || cycleGoals.some(g => g.status === 'draft');

      if (hasDraftsOrEmpty && daysSinceStart > Number(rules.goal_submission_days)) {
        const ruleKey = `goal-sheet-overdue:${employee.id}:${activeCycle.id}`;
        seenRuleKeys.add(ruleKey);
        const daysOverdue = daysSinceStart - Number(rules.goal_submission_days);
        const chainLevel = Math.min(3, Math.floor(daysOverdue / Number(rules.chain_intervals_days)) + 1);

        raiseRuleEscalation(db, {
          rule_key: ruleKey,
          employee_id: employee.id,
          escalation_type: 'goal_not_submitted',
          days_overdue: daysOverdue,
          chain_level: chainLevel,
          details: `Goal sheet unsubmitted after ${rules.goal_submission_days} days. Currently at level ${chainLevel} of escalation chain.`,
          source: 'rule'
        });
      } else if (!hasDraftsOrEmpty) {
        seenRuleKeys.add(`goal-sheet-overdue:${employee.id}:${activeCycle.id}`);
      }

      // 2. Manager Approval delay check
      const submittedGoals = cycleGoals.filter(g => g.status === 'submitted');
      if (submittedGoals.length > 0) {
        const submissionDates = submittedGoals.map(g => parseDateValue(g.updated_at || g.created_at || now));
        const earliestSubmission = new Date(Math.min(...submissionDates.map(d => d.getTime())));
        const daysSubmitted = Math.max(0, Math.ceil((now.getTime() - earliestSubmission.getTime()) / 86400000));

        if (daysSubmitted > Number(rules.manager_approval_days)) {
          const ruleKey = `approval-overdue:${employee.id}:${activeCycle.id}`;
          seenRuleKeys.add(ruleKey);
          const daysOverdue = daysSubmitted - Number(rules.manager_approval_days);
          const chainLevel = Math.min(3, Math.floor(daysOverdue / Number(rules.chain_intervals_days)) + 1);

          raiseRuleEscalation(db, {
            rule_key: ruleKey,
            employee_id: employee.id,
            escalation_type: 'approval_delayed',
            days_overdue: daysOverdue,
            chain_level: chainLevel,
            details: `Manager approval pending for ${daysSubmitted} days. Currently at level ${chainLevel} of escalation chain.`,
            source: 'rule'
          });
        }
      } else {
        seenRuleKeys.add(`approval-overdue:${employee.id}:${activeCycle.id}`);
      }

      // 3. Quarterly Check-in check
      if (!hasCheckin && daysSinceStart > Number(rules.checkin_completion_days)) {
        const ruleKey = `checkin-overdue:${employee.id}:${activeCycle.id}`;
        seenRuleKeys.add(ruleKey);
        const daysOverdue = daysSinceStart - Number(rules.checkin_completion_days);
        const chainLevel = Math.min(3, Math.floor(daysOverdue / Number(rules.chain_intervals_days)) + 1);

        raiseRuleEscalation(db, {
          rule_key: ruleKey,
          employee_id: employee.id,
          escalation_type: 'checkin_missing',
          days_overdue: daysOverdue,
          chain_level: chainLevel,
          details: `Quarterly check-in incomplete after active window of ${rules.checkin_completion_days} days. Escalation level ${chainLevel}.`,
          source: 'rule'
        });
      } else if (hasCheckin) {
        seenRuleKeys.add(`checkin-overdue:${employee.id}:${activeCycle.id}`);
      }
    }
  });

  (db.escalations || []).forEach((escalation) => {
    if (escalation.source === 'rule' && escalation.rule_key && !seenRuleKeys.has(escalation.rule_key)) {
      escalation.resolved = true;
      escalation.resolved_at = escalation.resolved_at || new Date().toISOString();
    }
  });
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
          feedbacks: [],
          checkin_comments: [],
          notifications: [],
          escalation_rules: {
            goal_submission_days: 10,
            manager_approval_days: 7,
            checkin_completion_days: 15,
            chain_intervals_days: 5
          }
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
    checkin_comments: [],
    notifications: [],
    escalation_rules: {
      goal_submission_days: 10,
      manager_approval_days: 7,
      checkin_completion_days: 15,
      chain_intervals_days: 5
    }
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

export function getActiveCycle() {
  const db = loadDb();
  return getActiveCycleRecord(db);
}

export function getCycleById(id) {
  const cycles = getCycles();
  return cycles.find((cycle) => String(cycle.id) === String(id)) || null;
}

export function createCycle(cycle) {
  const db = loadDb();
  const newCycle = {
    id: cycle.id || `cycle-${Date.now()}`,
    created_at: new Date().toISOString(),
    is_active: Boolean(cycle.is_active),
    ...cycle
  };

  if (newCycle.is_active) {
    db.cycles = (db.cycles || []).map((entry) => ({ ...entry, is_active: false }));
  }

  db.cycles = db.cycles || [];
  db.cycles.unshift(newCycle);
  saveDb(db);
  return newCycle;
}

export function updateCycle(id, updates) {
  const db = loadDb();
  const index = (db.cycles || []).findIndex((cycle) => String(cycle.id) === String(id));
  if (index === -1) {
    return null;
  }

  if (updates.is_active) {
    db.cycles = db.cycles.map((cycle) => ({ ...cycle, is_active: false }));
  }

  db.cycles[index] = {
    ...db.cycles[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  saveDb(db);
  return db.cycles[index];
}

export function createGoal(goal) {
  const db = loadDb();
  const activeCycle = getActiveCycleRecord(db);
  if (!activeCycle) {
    throw new Error('No active cycle is open for goal creation');
  }

  if (!isCycleWindowOpen(activeCycle)) {
    throw new Error('The active cycle is closed for goal entry');
  }

  const weightage = validateGoalWeightage(db, goal);
  const employeeGoalCount = getEmployeeGoalCount(db.goals || [], goal.employee_id, goal.cycle_id || activeCycle.id);
  if (employeeGoalCount >= 8) {
    throw new Error('Maximum 8 goals allowed per employee per cycle');
  }

  const currentTotal = getEmployeeGoalWeightageTotal(db.goals || [], goal.employee_id, goal.cycle_id || activeCycle.id, null);
  if (currentTotal + weightage > 100.0001) {
    throw new Error('Goal weightage would exceed 100% for this employee');
  }

  const newGoal = {
    id: goal.id || `goal-uuid-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cycle_id: goal.cycle_id || activeCycle.id,
    achievements: Array.isArray(goal.achievements) ? goal.achievements : [],
    ...goal,
    weightage
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

export function recordCheckin(input) {
  const db = loadDb();
  const activeCycle = getActiveCycleRecord(db);

  if (!activeCycle) {
    throw new Error('No active cycle found for check-in submission');
  }

  if (!isCycleWindowOpen(activeCycle)) {
    throw new Error('Check-ins are closed for the current cycle');
  }

  const employeeId = input.employee_id;
  if (!employeeId) {
    throw new Error('employee_id is required');
  }

  const quarter = input.quarter || getCurrentQuarterLabel(activeCycle);
  const targetGoals = input.goal_id
    ? (db.goals || []).filter((goal) => String(goal.id) === String(input.goal_id) && String(goal.employee_id) === String(employeeId))
    : (db.goals || []).filter((goal) => String(goal.employee_id) === String(employeeId) && String(goal.cycle_id || '') === String(input.cycle_id || activeCycle.id));

  if (targetGoals.length === 0) {
    throw new Error('No goals found for the selected check-in');
  }

  const achievementBlueprint = {
    cycle: activeCycle,
    cycle_id: input.cycle_id || activeCycle.id,
    quarter,
    planned_value: input.planned_value,
    actual_value: input.actual_value,
    progress_status: input.progress_status,
    computed_score: input.computed_score,
    note: input.note,
    submitted_at: input.completed_at || new Date().toISOString()
  };

  const updatedGoals = [];
  const scores = targetGoals.map((goal) => {
    const achievement = buildAchievement(goal, {
      ...achievementBlueprint,
      id: input.achievement_id ? `${input.achievement_id}-${goal.id}` : undefined,
      goal_id: goal.id
    });

    const goalIndex = db.goals.findIndex((entry) => String(entry.id) === String(goal.id));
    if (goalIndex !== -1) {
      db.goals[goalIndex] = {
        ...db.goals[goalIndex],
        updated_at: new Date().toISOString(),
        achievements: attachAchievement(db.goals[goalIndex], achievement)
      };
      updatedGoals.push(db.goals[goalIndex].id);
    }

    return achievement.computed_score;
  });

  const scoreAverage = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const newCheckin = {
    id: input.id || `checkin-${Date.now()}`,
    created_at: new Date().toISOString(),
    completed_at: input.completed_at || new Date().toISOString(),
    employee_id: employeeId,
    manager_id: input.manager_id || null,
    cycle_id: input.cycle_id || activeCycle.id,
    quarter,
    comment: input.comment || input.note || '',
    actual_value: input.actual_value ?? null,
    planned_value: input.planned_value ?? null,
    computed_score: scoreAverage,
    goal_ids: updatedGoals,
    ...input
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
  refreshRuleBasedEscalations(db);
  saveDb(db);
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

export function getNotifications() {
  const db = loadDb();
  return db.notifications || [];
}

export function createNotification(notif) {
  const db = loadDb();
  db.notifications = db.notifications || [];
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    is_read: false,
    ...notif
  };
  db.notifications.unshift(newNotif);
  saveDb(db);
  return newNotif;
}

export function markNotificationAsRead(id) {
  const db = loadDb();
  db.notifications = db.notifications || [];
  const index = db.notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    db.notifications[index].is_read = true;
    saveDb(db);
    return db.notifications[index];
  }
  return null;
}

export function markAllNotificationsAsRead(recipientEmail) {
  const db = loadDb();
  db.notifications = db.notifications || [];
  db.notifications.forEach(n => {
    if (n.recipient_email?.toLowerCase() === recipientEmail?.toLowerCase()) {
      n.is_read = true;
    }
  });
  saveDb(db);
  return true;
}

export function getEscalationRules() {
  const db = loadDb();
  return db.escalation_rules || {
    goal_submission_days: 10,
    manager_approval_days: 7,
    checkin_completion_days: 15,
    chain_intervals_days: 5
  };
}

export function updateEscalationRules(updates) {
  const db = loadDb();
  db.escalation_rules = {
    ...(db.escalation_rules || {
      goal_submission_days: 10,
      manager_approval_days: 7,
      checkin_completion_days: 15,
      chain_intervals_days: 5
    }),
    ...updates
  };
  saveDb(db);
  return db.escalation_rules;
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
  db.audit_logs = db.audit_logs || [];
  db.audit_logs.unshift(newLog); // newest first
  saveDb(db);
  return newLog;
}

export function getAuditLogs() {
  const db = loadDb();
  return db.audit_logs || [];
}
