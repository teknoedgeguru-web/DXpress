/**
 * Lightweight API client for D'Xpress
 * - Provides `get`, `post`, `syncCart`, and `queueOfflineSync` helpers
 * - Uses `fetch` when available; falls back to simulated responses
 * - Keeps a small offline queue in `localStorage` under `dx_offline_queue`
 */

const api = (function () {
    const OFFLINE_QUEUE_KEY = 'dx_offline_queue';

    async function request(method, path, body) {
        // Build full URL from apiConfig if available
        const base = (window.apiConfig && window.apiConfig.baseUrl) ? window.apiConfig.baseUrl : '';
        const url = base + path;

        // If fetch is available, try network call
        if (typeof fetch === 'function') {
            try {
                const headers = (window.apiConfig && window.apiConfig.headers) ? window.apiConfig.headers : { 'Content-Type': 'application/json' };
                const res = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: body ? JSON.stringify(body) : undefined
                });
                if (!res.ok) throw new Error('Network response not ok');
                return await res.json().catch(() => ({}));
            } catch (err) {
                // network failure
                throw err;
            }
        }

        // No fetch available â€” simulate response for static/demo app
        return Promise.resolve({ success: true, simulated: true });
    }

    async function get(path) {
        return request('GET', path);
    }

    async function post(path, body) {
        return request('POST', path, body);
    }

    // Sync cart with server; falls back to queueing if offline
    async function syncCart(cart) {
        try {
            // In a real setup, call your backend endpoint, e.g. '/api/cart/sync'
            await post('/api/cart/sync', { items: cart });
            return { success: true };
        } catch (err) {
            queueOfflineSync('cart', cart);
            return { success: false, queued: true };
        }
    }

    function queueOfflineSync(type, payload) {
        const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
        queue.push({ id: Date.now() + '_' + Math.random().toString(36).slice(2,8), type, payload, timestamp: new Date().toISOString() });
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }

    // Attempt to flush the offline queue
    async function flushQueue() {
        const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
        if (!queue.length) return;

        const remaining = [];
        for (const item of queue) {
            try {
                if (item.type === 'cart') {
                    await post('/api/cart/sync', { items: item.payload });
                } else {
                    await post(`/api/${item.type}`, item.payload);
                }
            } catch (err) {
                remaining.push(item);
            }
        }

        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    }

    // Try flushing when the client regains connectivity
    window.addEventListener('online', () => {
        flushQueue().catch(() => {});
    });

    return { get, post, syncCart, queueOfflineSync, flushQueue };
})();

// Expose as a global for the non-module static site
window.api = api;

