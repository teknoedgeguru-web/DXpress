/**
 * API configuration for D'Xpress
 * - Exposed as `window.apiConfig` for the static site
 * - Change `baseUrl` to point to your backend when available
 */

window.apiConfig = {
    baseUrl: '', // e.g. 'https://api.example.com' or '' for relative paths
    timeoutMs: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
};
