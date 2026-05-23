export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('gymToken');

export const getAuthHeaders = (headers = {}) => {
    const authHeaders = { ...headers };
    const token = getAuthToken();

    if (token && !authHeaders.Authorization) {
        authHeaders.Authorization = `Bearer ${token}`;
    }

    return authHeaders;
};

export const apiFetch = (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = getAuthHeaders(options.headers || {});

    if (options.body && !isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        ...options,
        headers
    });
};

const parseErrorMessage = async (res, fallback) => {
    try {
        const data = await res.json();
        return data.error || data.message || fallback;
    } catch {
        return fallback;
    }
};

export const requestJson = async (url, options = {}) => {
    const res = await apiFetch(url, options);

    if (!res.ok) {
        throw new Error(await parseErrorMessage(res, 'Request failed'));
    }

    if (res.status === 204) {
        return null;
    }

    return res.json();
};

export const fetchArray = async (url, options = {}) => {
    const { throwOnError = false } = options;
    try {
        const res = await apiFetch(url);
        if (!res.ok) {
            if (throwOnError) {
                throw new Error(await parseErrorMessage(res, `Failed to fetch ${url}`));
            }
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        if (throwOnError) {
            throw err;
        }
        console.error(`Failed to fetch ${url}:`, err);
        return [];
    }
};

export const fetchJson = async (url, fallback = null, options = {}) => {
    const { throwOnError = false } = options;
    try {
        const res = await apiFetch(url);
        if (!res.ok) {
            if (throwOnError) {
                throw new Error(await parseErrorMessage(res, `Failed to fetch ${url}`));
            }
            return fallback;
        }

        return await res.json();
    } catch (err) {
        if (throwOnError) {
            throw err;
        }
        console.error(`Failed to fetch ${url}:`, err);
        return fallback;
    }
};
