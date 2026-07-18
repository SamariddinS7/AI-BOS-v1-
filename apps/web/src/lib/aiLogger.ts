export async function logAIFailure(error: string, context: any, source: string) {
  try {
    await fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'admin',
        action: 'AI_FAILURE',
        module: source,
        ip_address: 'client-side',
        old_value: 'AI Request',
        new_value: JSON.stringify({ error, context })
      })
    });
  } catch (e) {
    console.error('Failed to log AI failure:', e);
  }
}
