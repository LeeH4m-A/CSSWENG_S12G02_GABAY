/**
 * Main application entry point.
 * Imports all other modules and initializes them.
 */

import { handleResponse } from './data-fetcher.js';
import { initializeCharts, setupChartFilters } from './filter-handler.js';
import { setupFormHandlers, formHelperFunctions } from './form-handler.js';
import { setupExportHandlers } from './export-handler.js';
import { domHelperFunctions } from './dom-utilities.js';

// --- Main Application Setup ---

/**
 * Event listener for the DOMContentLoaded event.
 * Initializes the page and sets up event handlers.
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Handle url parameters
        await handleResponse();
        // We check if the dashboard container exists before trying to load charts
        if (document.querySelector('.biomedical-container')) {
            // Fetch data and initialize charts after the DOM is fully loaded
            await initializeCharts();
            
            // Setup dynamic chart filtering (month, quarter, year dropdowns)
            setupChartFilters();

            // Setup data export buttons
            setupExportHandlers();
        }

        // Set up all form/modal/button listeners (sidebar, edit, filter, etc.)
        // This will run on any page.
        setupFormHandlers();


    } catch (error) {
        console.error("Error during application initialization:", error);
        alert("A critical error occurred while loading the page. Please try refreshing.");
    }

    // --- Global Bridge ---
    // Expose functions to the global 'window' object so that inline HTML attributes (like onclick="...") can find them.
    window.gabayHelpers = {
        ...formHelperFunctions,
        ...domHelperFunctions
    };
});

