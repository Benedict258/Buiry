export function exportSessions(sessions: any[], format: 'json' | 'csv' | 'txt') {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(sessions, null, 2);
    filename = 'buiry-sessions.json';
    mimeType = 'application/json';
  } else if (format === 'csv') {
    const headers = ['session_id', 'timestamp', 'ai_agent', 'current_phase', 'progress', 'summary'];
    const rows = sessions.map(s => [
      s.session_id || '', s.timestamp || '', s.ai_agent || '',
      s.current_phase || '', s.progress || '', s.last_session_summary || ''
    ]);
    content = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    filename = 'buiry-sessions.csv';
    mimeType = 'text/csv';
  } else {
    content = sessions.map(s =>
      `[${s.timestamp}] ${s.ai_agent} — ${s.current_phase}\n${s.last_session_summary}\n---\n`
    ).join('\n');
    filename = 'buiry-sessions.txt';
    mimeType = 'text/plain';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export function exportSingleSession(session: any) {
  return exportSessions([session], 'json');
}
