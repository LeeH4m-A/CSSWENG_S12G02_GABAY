/**
 * Handles all network requests (fetching data).
 */

/**
 * Fetches data from the given endpoint.
 * @async
 * @param {string} endpoint - The URL to fetch data from.
 * @returns {Promise<Object|null>} The fetched data or null in case of an error.
 */
export async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return responseData.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

/**
 * Fetches and handles response parameters from the URL.
 * Displays an alert if a message or error is present in the URL parameters.
 */
export async function handleResponse() {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    const error = params.get('error');

    // Use a non-blocking way to show messages if possible, but alert is simple
    if (message) {
        alert(message);
    }
    if (error) {
        alert(error);
    }
    // Clean the URL
    if (message || error) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
