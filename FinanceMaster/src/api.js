// src/api.js
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiGet(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        credentials: opts.credentials || 'same-origin', // use 'include' if you need cookies
        ...opts.fetchOptions
    });
    if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`);
    return res.json();
}

export async function apiPost(path, body, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        credentials: opts.credentials || 'same-origin',
        body: JSON.stringify(body),
        ...opts.fetchOptions
    });
    if (!res.ok) throw new Error(`API POST ${path} failed: ${res.status}`);
    return res.json();
}