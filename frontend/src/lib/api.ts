const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api';

// ─── Bot CRUD ───────────────────────────────────────────────────────────────

export const createBot = async (companyName: string) => {
    const res = await fetch(`${API_BASE}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to create bot');
    return data;
};

export const listBots = async () => {
    const res = await fetch(`${API_BASE}/bots`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to list bots');
    return data;
};

export const deleteBot = async (botId: string) => {
    const res = await fetch(`${API_BASE}/bots/${botId}`, {
        method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to delete bot');
    return data;
};

// ─── Ingestion ──────────────────────────────────────────────────────────────

export const ingestUrl = async (url: string, botId: string) => {
    const res = await fetch(`${API_BASE}/ingest/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, bot_id: botId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to ingest URL');
    return data;
};

export const ingestDocument = async (file: File, botId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bot_id', botId);
    const res = await fetch(`${API_BASE}/ingest/document`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to ingest document');
    return data;
};

export const ingestGoogleDrive = async (botId: string, folderId: string = 'root') => {
    const res = await fetch(`${API_BASE}/ingest/gdrive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, folder_id: folderId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to sync Google Drive');
    return data;
};

// ─── Chat ───────────────────────────────────────────────────────────────────

export const chatWithBot = async (query: string, botId: string, sessionId = 'default') => {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, bot_id: botId, session_id: sessionId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to chat');
    return data;
};

// ─── Config ─────────────────────────────────────────────────────────────────

export const getConfig = async (botId: string) => {
    const res = await fetch(`${API_BASE}/config?bot_id=${encodeURIComponent(botId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to get config');
    return data;
};

export const updateConfig = async (botId: string, name: string, primaryColor: string, welcomeMessage: string) => {
    const res = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bot_id: botId,
            name,
            primary_color: primaryColor,
            welcome_message: welcomeMessage
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update config');
    return data;
};
