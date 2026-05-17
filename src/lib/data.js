import { supabase } from './supabase';

/**
 * Fetches the currently active goal cycle.
 */
export async function fetchActiveCycle() {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching active cycle:', error);
    return null;
  }
  return data;
}

/**
 * Fetches all goals for a specific employee.
 */
export async function fetchEmployeeGoals(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('*, achievements(*)')
    .eq('employee_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching employee goals:', error);
    return [];
  }
  return data;
}

/**
 * Fetches the team members and their goal status for a manager.
 */
export async function fetchManagerTeam(managerId) {
  // 1. Fetch direct report profiles
  const { data: members, error: memberErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('manager_id', managerId);
  
  if (memberErr) {
    console.error('Error fetching manager team members:', memberErr);
    return [];
  }

  if (!members || members.length === 0) {
    return [];
  }

  // 2. Batch fetch all goals for these direct reports
  const memberIds = members.map(m => m.id);
  const { data: goals, error: goalsErr } = await supabase
    .from('goals')
    .select('*')
    .in('employee_id', memberIds);

  if (goalsErr) {
    console.error('Error fetching manager team goals:', goalsErr);
    // Graceful fallback: return members with empty goals list
    return members.map(m => ({ ...m, goals: [] }));
  }

  // 3. Map goals back to their respective employees
  return members.map(member => ({
    ...member,
    goals: (goals || []).filter(g => g.employee_id === member.id)
  }));
}

/**
 * Fetches org-wide statistics for the admin dashboard.
 */
export async function fetchAdminStats() {
  // This is a simplified version. In a real app, you might use an RPC or multiple queries.
  const { data: cycles } = await supabase.from('cycles').select('name').eq('is_active', true).limit(1).maybeSingle();
  const { count: totalGoals } = await supabase.from('goals').select('*', { count: 'exact', head: true });
  const { count: submittedGoals } = await supabase.from('goals').select('*', { count: 'exact', head: true }).neq('status', 'draft');
  const { count: escalations } = await supabase.from('escalations').select('*', { count: 'exact', head: true }).eq('resolved', false);

  return {
    activeCycle: cycles?.name || 'No Active Cycle',
    submissionRate: totalGoals ? Math.round((submittedGoals / totalGoals) * 100) : 0,
    escalationCount: escalations || 0
  };
}

/**
 * Fetches the user profile by ID.
 */
export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}
