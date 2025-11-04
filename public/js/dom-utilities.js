/**
 * Contains generic DOM manipulation and utility functions.
 */

/**
 * Toggles the display of graphs and filters in the container.
 * @param {HTMLElement} button - The button that triggers the toggle.
 */
function toggleGraphs(button) {
    const container = button.closest('.container');
    if (!container) return;
    
    const graphContainer = container.querySelector('.biomedical-container') || container.querySelector('.nonbiomedical-container');
    const filter = container.querySelector('.filter');
    const icon = button.querySelector('i');

    if (graphContainer.style.display === 'none') {
        graphContainer.style.display = 'grid';
        if (filter) filter.style.display = 'flex';
        if (icon) icon.classList.replace('bxs-chevron-up', 'bxs-chevron-down');
    } else {
        graphContainer.style.display = 'none';
        if (filter) filter.style.display = 'none';
        if (icon) icon.classList.replace('bxs-chevron-down', 'bxs-chevron-up');
    }
}

/**
* Displays a message indicating no data available.
* @param {string} selector - CSS selector for the container where the message should be displayed.
* @param {string} reasonText - Reason text to display alongside the message.
*/
function displayNoDataMessage(selector, reasonText, targetId) {
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
        container.innerHTML = `
            <p class="reason">${reasonText}</p>
            <p class="message">No data available yet.</p>
            <div class="chart" style="display: none;"> 
                <canvas id="${targetId}"></canvas>
            </div>
        `;
    });
}

/**
* Removes no data message.
* @param {string} selector - CSS selector for the container where the message should be displayed.
* @param {string} reasonText - Reason text to display alongside the message.
*/
function removeNoDataMessage(selector, reasonText, targetId) {
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
        container.innerHTML = `
            <p class="reason">${reasonText}</p>
            <div class="chart">
                <canvas id="${targetId}"></canvas>
            </div>
        `;
    });
}

// Export functions to be used globally
export const domHelperFunctions = {
    toggleGraphs,
    displayNoDataMessage,
    removeNoDataMessage
};