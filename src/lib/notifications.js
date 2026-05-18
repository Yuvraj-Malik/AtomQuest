import { createNotification, getProfileById } from './backendDb';
import { sendTeamsNotification } from './teams';

/**
 * Triggers a simulated Email and/or Microsoft Teams notification.
 * Saves the alert to the local database.json array and attempts real Teams webhook delivery.
 *
 * @param {Object} params
 * @param {string} params.recipientId - Recipient profile ID
 * @param {string} params.recipientEmail - Recipient email (for Outlook simulation)
 * @param {string} params.type - Communication channel ('email' | 'teams')
 * @param {string} params.event - Event trigger type ('goal_submitted' | 'goal_approved' | 'goal_returned' | 'checkin_submitted' | 'checkin_reminder' | 'escalated')
 * @param {string} params.subject - Header or title of the alert
 * @param {string} params.body - Rich message content or text
 * @param {string} params.deepLink - Functional target URL inside the portal (e.g., /employee/goals?cycleId=...)
 */
export async function triggerNotification({
  recipientId,
  recipientEmail,
  type = 'email',
  event,
  subject,
  body,
  deepLink
}) {
  try {
    let targetEmail = recipientEmail;
    let targetId = recipientId;

    // Resolve recipient profile if only ID or only Email is provided
    if (recipientId && !targetEmail) {
      const profile = getProfileById(recipientId);
      if (profile) targetEmail = profile.email;
    }

    // Save simulated notification to local JSON database
    const newNotif = createNotification({
      recipient_id: targetId || null,
      recipient_email: targetEmail || 'corporate@demo.com',
      type, // 'email' or 'teams'
      event,
      subject,
      body,
      deep_link: deepLink || null,
      submitted_at: new Date().toISOString()
    });

    // If channel is 'teams', attempt to dispatch a real Teams notification card
    if (type === 'teams') {
      const facts = [
        { name: 'Event', value: event.replace(/_/g, ' ') },
        { name: 'Message', value: body }
      ];
      if (deepLink) {
        facts.push({ name: 'Action Link', value: deepLink });
      }
      
      await sendTeamsNotification(subject, facts).catch((teamsError) => {
        console.warn('Real MS Teams delivery skipped or failed:', teamsError.message);
      });
    }

    return newNotif;
  } catch (error) {
    console.error('Failed to trigger notification:', error);
    return null;
  }
}
