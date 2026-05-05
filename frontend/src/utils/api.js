export const API_BASE_URL = 'http://localhost:5000';

export const fetchArray = async (url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) return [];

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(`Failed to fetch ${url}:`, err);
        return [];
    }
};

export const fetchJson = async (url, fallback = null) => {
    try {
        const res = await fetch(url);
        if (!res.ok) return fallback;

        return await res.json();
    } catch (err) {
        console.error(`Failed to fetch ${url}:`, err);
        return fallback;
    }
};
