/**
 * Handles all Chart.js data processing and rendering logic.
 */
import { domHelperFunctions } from './dom-utilities.js';
import { processBiomedicalChartData, processNonBiomedicalChartData } from './chart-data-processor.js';

// Store chart metadata to link IDs to selectors and reasons
export const chartSelectors = [
    { id: 'chartReason', selector: '.graph3', reason: 'Testing outcomes by main reason for HIV Test:' },
    { id: 'chartKVP', selector: '.graph5', reason: 'Testing outcomes by Key or Vulnerable Population (KVP) at higher risk' },
    { id: 'chartTestedBefore', selector: '.graph1', reason: 'Testing outcomes for clients who were tested before (repeat testers)' },
    { id: 'chartAge', selector: '.graph2', reason: 'Testing outcomes by age' },
    { id: 'chartFirstTimeTesters', selector: '.graph4', reason: 'Testing outcomes for first time testers' },
    { id: 'chartLinkage', selector: '.graph6', reason: 'Linkage for positive clients' },
    { id: 'chartStigma', selector: '.graph7', reason: 'Testing outcomes for stigma' },
    { id: 'chartDiscrimination', selector: '.graph8', reason: 'Testing outcomes for discrimination' },
    { id: 'chartViolence', selector: '.graph9', reason: 'Testing outcomes for violence' },
];

/**
 * Finds the metadata for a chart by its canvas ID.
 */
function getChartMeta(ctxId) {
    const meta = chartSelectors.find(c => c.id === ctxId);
    if (!meta) {
        console.warn(`No metadata found for chart ID: ${ctxId}`);
        return { id: ctxId, selector: 'body', reason: 'Unknown Chart' };
    }
    return meta;
}

/**
 * Renders a chart using Chart.js, or displays a 'no data' message.
 * @param {CanvasRenderingContext2D} ctx - The context of the canvas element to render the chart on.
 * @param {Object} data - The data for the chart.
 * @param {Object} config - The configuration options for the chart.
 */
export function renderChart(ctxId, rawData, labelKey, config, isBiomedical = true) {
    const ctx = document.getElementById(ctxId)?.getContext('2d');
    if (!ctx) {
        console.error(`Canvas context with ID "${ctxId}" not found.`);
        return null;
    }

    const { selector, reason } = getChartMeta(ctxId);

    // Set attribute for exporters
    ctx.canvas.setAttribute('data-reason', reason);

    const processFunction = isBiomedical ? processBiomedicalChartData : processNonBiomedicalChartData;
    const chartData = processFunction(rawData, labelKey);

    if (chartData.datasets.length === 0) {
        domHelperFunctions.displayNoDataMessage(selector, reason, ctxId);
        return null;
    }

    try {
        return new Chart(ctx, { ...config, data: chartData });
    } catch (error) {
        console.error(`Error rendering chart ${ctxId}:`, error);
        return null;
    }
}