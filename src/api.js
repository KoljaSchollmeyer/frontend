const API_BASE = import.meta.env.VITE_API_URL || '';

async function throwApiError(res, method, path) {
    let detail = `${res.status}`;
    try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const data = await res.json();
            if (data && (data.message || data.error)) {
                detail = `${detail} - ${data.message || data.error}`;
            }
        } else {
            const text = await res.text();
            if (text) detail = `${detail} - ${text}`;
        }
    } catch (_) {
        // ignore parse errors
    }
    throw new Error(`API ${method} ${path} failed: ${detail}`);
}

export async function apiGet(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        credentials: opts.credentials || 'same-origin',
        ...opts.fetchOptions
    });
    if (!res.ok) return throwApiError(res, 'GET', path);
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
    if (!res.ok) return throwApiError(res, 'POST', path);
    return res.json();
}

export async function apiDelete(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        credentials: opts.credentials || 'same-origin',
        ...opts.fetchOptions
    });
    if (!res.ok) return throwApiError(res, 'DELETE', path);
    return true;
}

// Specialized helpers
export async function createUser({ name, email, password }) {
    return apiPost('/users', { name, email, password })
}

// Note: category/transaction GETs are called via apiGet with query strings directly

export async function createCategory({ name, description, userId }) {
    return apiPost('/categories', { name, description, user: { id: userId } })
}

export async function createTransaction({ type, amount, description, date, categoryId, userId }) {
    // Assume categoryId is required by UI; backend expects both user.id and category.id
    const body = {
        type,
        amount: parseFloat(amount),
        description,
        date,
        category: { id: Number(categoryId) },
        user: { id: userId }
    }
    return apiPost('/transactions', body)
}

// Note: per-user DELETEs are invoked directly via apiDelete with query strings