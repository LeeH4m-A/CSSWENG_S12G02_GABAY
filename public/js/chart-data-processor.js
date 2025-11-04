/**
 * Contains functions specifically for processing raw data into Chart.js format.
 * This is separated from chart-renderer.js to keep rendering logic clean.
 */

/**
 * Determines the color based on test_result and gender for biomedical records.
 * @param {string} test_result - The test result (e.g., "Positive", "Negative").
 * @param {string} gender - The gender (e.g., "Male", "Female", "Transgender").
 * @returns {string} The corresponding color in rgba format.
 */
function getBioColor(test_result, gender) {
    const colors = {
        Positive: {
            Male: 'rgba(0, 150, 136, 0.3)',
            Female: 'rgba(233, 30, 99, 0.3)',
            Transgender: 'rgba(225, 152, 0, 0.3)'
        },
        Negative: {
            Male: 'rgba(159, 244, 245, 0.7)',
            Female: 'rgba(233, 30, 99, 0.7)',
            Transgender: 'rgba(255, 152, 0, 0.7)'
        },
        'Do Not Know': {
            Male: 'rgba(95, 125, 139, 0.3)',
            Female: 'rgba(255, 105, 180, 0.5)',
            Transgender: 'rgba(255, 152, 0, 0.5)'
        }
    };
    // check if test_result and gender are valid keys in colors object
    if (colors[test_result] && colors[test_result][gender]) {
        return colors[test_result][gender];
    }
    // return a default color if combination is not recognized
    return 'rgba(0, 0, 0, 0.5)'; // Default
}

/**
 * Determines the color based on gender for nonbiomedical records.
 * @param {string} gender - The gender (e.g., "Male", "Female", "Transgender").
 * @returns {string} The corresponding color in rgba format.
 */
function getNonbioColor(gender) {
    const colors = {
        Male: 'rgba(0, 150, 136, 0.3)',
        Female: 'rgba(233, 30, 99, 0.3)',
        Transgender: 'rgba(225, 152, 0, 0.3)'
    };
    return colors[gender] || 'rgba(0, 0, 0, 0.5)'; // default color
}

/**
 * Processes biomedical data for a specific chart.
 * @param {Array} array - The data array to process.
 * @param {string} labelKey - The key used for labeling data points.
 * @returns {Object} An object containing labels and datasets for the chart.
 */
export function processBiomedicalChartData(array, labelKey) {
    if (!Array.isArray(array) || array.length === 0) {
        console.error('Expected a non-empty array for data processing:', array);
        return { labels: [], datasets: [] };
    }

    const labels = [];
    const datasets = [];

    array.forEach(item => {
        const { gender, test_result } = item._id;
        const count = item.count;
        const label = item._id[labelKey];

        if (!gender || !test_result || label === undefined) {
            console.error('Missing gender or test_result in data:', item._id);
            return; // skip this item if gender or test_result is missing
        }

        const datasetLabel = `${test_result} ${gender}`;
        let dataset = datasets.find(ds => ds.label === datasetLabel);

        if (!dataset) {
            dataset = {
                label: datasetLabel,
                backgroundColor: getBioColor(test_result, gender),
                data: [],
                meta: []
            };
            datasets.push(dataset);
        }

        let labelIndex = labels.indexOf(label);
        if (labelIndex === -1) {
            labels.push(label);
            labelIndex = labels.length - 1;
            // Ensure all datasets have this new label
            datasets.forEach(ds => ds.data[labelIndex] = 0);
        }

        dataset.data[labelIndex] = count;
        dataset.meta[labelIndex] = { gender, test_result, count };
    });

    const filteredDatasets = datasets.filter(ds => ds.data.some(data => data > 0));

    return { labels, datasets: filteredDatasets };
}

/**
 * Processes nonbiomedical data for a specific chart.
 * @param {Array} array - The data array to process.
 * @param {string} labelKey - The key used for labeling data points.
 * @returns {Object} An object containing labels and datasets for the chart.
 */
export function processNonBiomedicalChartData(array, labelKey) {
    if (!Array.isArray(array) || array.length === 0) {
        console.error('Expected a non-empty array for data processing:', array);
        return { labels: [], datasets: [] };
    }

    const labels = [];
    const datasets = [];

    array.forEach(item => {
        const { gender } = item._id;
        const count = item.count;
        const label = item._id[labelKey];

        if (!gender || label === undefined) {
            console.error('Missing gender or label in data:', item._id);
            return; // skip this item if gender or label is missing
        }

        const datasetLabel = `${gender}`;
        let dataset = datasets.find(ds => ds.label === datasetLabel);

        if (!dataset) {
            dataset = {
                label: datasetLabel,
                backgroundColor: getNonbioColor(gender),
                data: [],
                meta: []
            };
            datasets.push(dataset);
        }

        let labelIndex = labels.indexOf(label);
        if (labelIndex === -1) {
            labels.push(label);
            labelIndex = labels.length - 1;
            // Ensure all datasets have this new label
            datasets.forEach(ds => ds.data[labelIndex] = 0);
        }

        dataset.data[labelIndex] = count;
        dataset.meta[labelIndex] = { gender, count };
    });

    const filteredDatasets = datasets.filter(ds => ds.data.some(data => data > 0));

    return { labels, datasets: filteredDatasets };
}