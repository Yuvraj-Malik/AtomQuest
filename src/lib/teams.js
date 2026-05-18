export async function sendTeamsNotification(message, facts = []) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    return { skipped: true, reason: 'TEAMS_WEBHOOK_URL not configured' };
  }

  const payload = {
    text: message,
    sections: facts.length > 0 ? [{ facts }] : undefined
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Teams webhook failed: ${response.status} ${body}`);
  }

  return { skipped: false, ok: true };
}