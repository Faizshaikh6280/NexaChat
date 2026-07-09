const API_BASE = 'http://localhost:8000/api';

export const ingestUrl = async (url: string) => {
    const res = await fetch(`${API_BASE}/ingest/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to ingest URL');
    return data;
};

export const ingestDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/ingest/document`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to ingest document');
    return data;
};

export const ingestGoogleDrive = async () => {
    const res = await fetch(`${API_BASE}/ingest/gdrive`, {
        method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to sync Google Drive');
    return data;
};

export const chatWithBot = async (query: string, sessionId = 'default') => {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sessionId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to chat');
    return data;
};
