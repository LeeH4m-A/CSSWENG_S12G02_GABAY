/**
 * Handles all logic for initializing and filtering the dashboard charts.
 */
import { fetchData } from './data-fetcher.js';
import { renderChart, chartSelectors } from './chart-renderer.js';
import { domHelperFunctions } from './dom-utilities.js';

//declaring charts
let bioChart1, bioChart2, bioChart3, bioChart4, bioChart5, bioChart6;
let nonbioChart1, nonbioChart2, nonbioChart3;

/**
 * Constructs the query string for filtering.
 */
function getQueryParams(monthly = 0, yearly = 0, quarter = 0) {
    const params = new URLSearchParams();
    if (quarter && quarter != 0) {
        params.append('quarter', quarter);
        if (yearly && yearly != 0) {
            params.append('yearly', yearly);
        }
    } else {
        if (monthly && monthly != 0) {
            params.append('monthly', monthly);
        }
        if (yearly && yearly != 0) {
            params.append('yearly', yearly);
        }
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Initializes charts by fetching data and rendering them.
 */
export async function initializeCharts(monthly = 0, yearly = 0, quarter = 0) {
    const queryParams = getQueryParams(monthly, yearly, quarter);

    try {
        const data = await fetchData(`/dashboard/data${queryParams}`);
        if (!data) {
            // display message if no data fetched
            domHelperFunctions.displayNoDataMessage('.biomedical-container, .nonbiomedical-container');
            return;
        }

        // Configuration for all bar charts
        const config = {
            type: 'bar',
            data: {},
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        }
                    }
                }
            }
        };

        // Destroy existing charts before re-rendering
        [
            bioChart1, bioChart2, bioChart3, bioChart4, bioChart5, bioChart6,
            nonbioChart1, nonbioChart2, nonbioChart3
        ].forEach(chart => chart?.destroy()); // Use optional chaining

        // --- Biomedical Charts ---
        
        // get chart contexts for biomedical records
        // const ctxReason = document.getElementById('chartReason').getContext('2d');
        // const ctxKVP = document.getElementById('chartKVP').getContext('2d');
        // const ctxTestedBefore = document.getElementById('chartTestedBefore').getContext('2d');
        // const ctxAge = document.getElementById('chartAge').getContext('2d');
        // const ctxFirstTimeTesters = document.getElementById('chartFirstTimeTesters').getContext('2d');
        // const ctxLinkage = document.getElementById('chartLinkage').getContext('2d');

        // check if each dataset has data, otherwise display a message
        bioChart1 = renderChart('chartReason', data.reason, 'reason', config);
        bioChart2 = renderChart('chartKVP', data.kvp, 'kvp', config);
        bioChart3 = renderChart('chartTestedBefore', data.tested_before, 'tested_before', config);
        bioChart4 = renderChart('chartAge', data.age_range, 'age_range', config);
        bioChart5 = renderChart('chartFirstTimeTesters', data.tested_before.filter(item => item._id.tested_before === 'No'), 'tested_before', config);
        bioChart6 = renderChart('chartLinkage', data.linkage, 'linkage', config);

        // --- Nonbiomedical Charts ---
        
        // get chart contexts for nonbiomedical records
        // const ctxStigma = document.getElementById('chartStigma').getContext('2d');
        // const ctxDiscrimination = document.getElementById('chartDiscrimination').getContext('2d');
        // const ctxViolence = document.getElementById('chartViolence').getContext('2d');

        // check if each dataset has data, otherwise display a message
        nonbioChart1 = renderChart('chartStigma', data.stigma, 'stigma', config, false);
        nonbioChart2 = renderChart('chartDiscrimination', data.discrimination, 'discrimination', config, false);
        nonbioChart3 = renderChart('chartViolence', data.violence, 'violence', config, false);

    } catch (error) {
        console.error('Error fetching or processing data:', error);
        domHelperFunctions.displayNoDataMessage('.biomedical-container, .nonbiomedical-container');
    }
}

/**
 * Sets up event listeners for month, quarter, and year filters.
 */
export function setupChartFilters() {
    const monthlyFilter = document.querySelector('#monthlyFilter');
    const quarterFilter = document.querySelector('#quarterFilter');
    const yearlyFilter = document.querySelector('#yearlyFilter');

    // DRY the filter change handler
    const handleFilterChange = async () => {
        try {
            /**
             * Filters graphs by month
             */
            const monthValue = monthlyFilter ? monthlyFilter.value : 0;
            /**
             * Filters graphs by quarter of the year
             */
            const quarterValue = quarterFilter ? quarterFilter.value : 0;
            /**
             * Filters graphs by year
             */
            const yearValue = yearlyFilter ? yearlyFilter.value : 0;

            if (quarterFilter && monthlyFilter && quarterValue != '') {
                monthlyFilter.setAttribute('hidden', '');
            } else if (monthlyFilter) {
                monthlyFilter.removeAttribute('hidden');
            }

            // Clear 'No Data' messages before re-rendering
            chartSelectors.forEach(item => {
                domHelperFunctions.removeNoDataMessage(item.selector, item.reason, item.id);
            });

            await initializeCharts(monthValue, yearValue, quarterValue);
        } catch (error) {
            console.error('Error filtering chart data:', error);
            alert('An error occurred while filtering chart data.');
        }
    };

    if (monthlyFilter) monthlyFilter.onchange = handleFilterChange;
    if (quarterFilter) quarterFilter.onchange = handleFilterChange;
    if (yearlyFilter) yearlyFilter.onchange = handleFilterChange;
}