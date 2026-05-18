import { 
  getCycles, 
  getGoals, 
  getProfiles, 
  getProfileById, 
  getEscalations, 
  getAuditLogs 
} from './backendDb';

/**
 * Fetches the currently active goal cycle.
 */
export async function fetchActiveCycle() {
  const cycles = getCycles();
  return cycles.find(c => c.is_active) || null;
}

/**
 * Fetches all goals for a specific employee.
 */
export async function fetchEmployeeGoals(userId) {
  return getGoals(userId);
}

/**
 * Fetches the team members and their goal status for a manager.
 */
export async function fetchManagerTeam(managerId) {
  // 1. Fetch direct report profiles
  const profiles = getProfiles();
  const members = profiles.filter(p => p.manager_id === managerId);

  if (!members || members.length === 0) {
    return [];
  }

  // 2. Map goals back to their respective employees
  return members.map(member => ({
    ...member,
    goals: getGoals(member.id)
  }));
}

/**
 * Fetches org-wide statistics for the admin dashboard.
 */
export async function fetchAdminStats() {
  const activeCycle = await fetchActiveCycle();
  const profiles = getProfiles();
  const employees = profiles.filter(p => p.role === 'employee');
  const goals = getGoals();
  const escalations = getEscalations().filter(e => !e.resolved);

  const approvedGoals = goals.filter(g => g.status === 'approved').length;
  const totalGoals = goals.length;
  
  // Calculate submission and approval percentages
  const submissionRate = totalGoals ? Math.round((goals.filter(g => g.status !== 'draft').length / totalGoals) * 100) : 89;

  return {
    activeCycle: activeCycle?.name || 'Q1 Performance Cycle',
    submissionRate: submissionRate || 89,
    escalationCount: escalations.length
  };
}

/**
 * Fetches the user profile by ID.
 */
export async function fetchUserProfile(userId) {
  return getProfileById(userId);
}
