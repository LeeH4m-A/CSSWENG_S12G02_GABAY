import { patientModel } from '../model/model.js';

const biomedical_filters = {
    bioGenderFilter: 'gender',
    bioFromDateFilter: { 
        field: 'date_encoded', 
        operator: '$gte', 
        isDate: true 
    },
    bioToDateFilter: { 
        field: 
        'date_encoded', 
        operator: '$lte', 
        isDate: true 
    },
    locationFilter: 'biomedical.location',
    ageRangeFilter: 'biomedical.age_range',
    testedBeforeFilter: 'biomedical.tested_before',
    testResultFilter: 'biomedical.test_result',
    reasonFilter: 'biomedical.reason',
    kvpFilter: 'biomedical.kvp',
    linkageFilter: 'biomedical.linkage',
};

const non_biomedical_filters = {
    nonBioGenderFilter: 'gender',
    nonBioFromDateFilter: { 
        field: 'date_encoded', 
        operator: '$gte', 
        isDate: true 
    },
    nonBioToDateFilter: { 
        field: 'date_encoded', 
        operator: '$lte', 
        isDate: true 
    },
    stigmaFilter: 'nonbiomedical.stigma',
    discriminationFilter: 'nonbiomedical.discrimination',
    violenceFilter: 'nonbiomedical.violence',
};


function applyFiltersToQuery(query, filters, filterMap) {
    for (const [filterKey, dbField] of Object.entries(filterMap)) {
        const value = filters[filterKey];
        if (!value){
            continue;
        } 

        if (typeof dbField === 'string') {
            query = query.where(dbField).equals(value);
        } else if (dbField.isDate) {
            console.log(dbField);
            query = query.where(dbField.field)[dbField.operator.replace(/^\$/, '')](new Date(value));
        }
    }
    return query;
}

/**
 * This function is used as a helper function for /data endpoint
 * It creates the medical queries that will be executed later
 * 
 * @param {*} filters 
 * @returns filteredPatients
 */
export default async function createMedicalQueries(filters) {
    try {
        let biomedicalQuery = patientModel.find({ data_type: 'Biomedical' });
        let nonBiomedicalQuery = patientModel.find({ data_type: 'Nonbiomedical' });

        biomedicalQuery = applyFiltersToQuery(biomedicalQuery, filters, biomedical_filters);
        nonBiomedicalQuery = applyFiltersToQuery(nonBiomedicalQuery, filters, non_biomedical_filters);

        return { biomedicalQuery, nonBiomedicalQuery};
    } catch (err) {
        console.error(err);
        throw err;
    }
}


export function getQuarterFilter(quarter) {
    if (!quarter || quarter < 1 || quarter > 4) return [];

    const startMonth = quarter * 3 - 2;
    const months = [startMonth, startMonth + 1, startMonth + 2];
    // I can use loops but uhhhhh...a
    return [
        {
            $match: {
                $expr: { $in: ['$filterMonth', months] }
            }
        }
    ];
}