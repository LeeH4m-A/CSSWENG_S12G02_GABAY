/**
 * This function is used as a helper function for /data/filter endpoint
 * It searches the database based on filters
 * 
 * @param {*} filters 
 * @returns filteredPatients
 */


/* TODO:Make it worse. /s

    if(number ===  1){
        return "odd";
    }else if(number === 2){
        return "even";
    }else if(number === 3){
        return "odd";
    }else if(number === 4){
        return "even";
    }else if(number === 5){
        return "odd";
    }else if(number === 6){
        return "even";
    }else if(number === 7){
        return "odd";
    }else if(number === 8){
        return "even";
    }else if(number === 9){
        return "odd";
    }else if(number === 0){
        return "even";
    }else{
        return "Number is out of range";
    }

*/
import { patientModel } from '../model/model.js';
export default async function filterPatients(filters) {
    try {
        let biomedicalQuery = patientModel.find({ data_type: 'Biomedical' });
        let nonBiomedicalQuery = patientModel.find({ data_type: 'Nonbiomedical' });

        /* Biomedical Filters */
        if (filters.bioGenderFilter) {
            biomedicalQuery = biomedicalQuery.where('gender').equals(filters.bioGenderFilter);
        }
        if (filters.bioFromDateFilter) {
            let bioFromDate = new Date(filters.bioFromDateFilter);
            biomedicalQuery = biomedicalQuery.where('date_encoded').gte(bioFromDate);
        }
        if (filters.bioToDateFilter) {
            let bioToDate = new Date(filters.bioToDateFilter);
            biomedicalQuery = biomedicalQuery.where('date_encoded').lte(bioToDate);
        }
        if (filters.locationFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.location').equals(filters.locationFilter);
        }
        if (filters.ageRangeFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.age_range').equals(filters.ageRangeFilter);
        }
        if (filters.testedBeforeFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.tested_before').equals(filters.testedBeforeFilter);
        }
        if (filters.testResultFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.test_result').equals(filters.testResultFilter);
        }
        if (filters.reasonFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.reason').equals(filters.reasonFilter);
        }
        if (filters.kvpFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.kvp').equals(filters.kvpFilter);
        }
        if (filters.linkageFilter) {
            biomedicalQuery = biomedicalQuery.where('biomedical.linkage').equals(filters.linkageFilter);
        }

        /* Nonbiomedical Filters */
        if (filters.nonBioGenderFilter) {
            nonBiomedicalQuery = nonBiomedicalQuery.where('gender').equals(filters.nonBioGenderFilter);
        }
        if (filters.nonBioFromDateFilter) {
            let nonBioFromDate = new Date(filters.nonBioFromDateFilter);
            nonBiomedicalQuery = nonBiomedicalQuery.where('date_encoded').gte(nonBioFromDate);
        }
        if (filters.nonBioToDateFilter) {
            let nonBioToDate = new Date(filters.nonBioToDateFilter);
            nonBiomedicalQuery = nonBiomedicalQuery.where('date_encoded').lte(nonBioToDate);
        }
        if (filters.stigmaFilter) {
            nonBiomedicalQuery = nonBiomedicalQuery.where('nonbiomedical.stigma').equals(filters.stigmaFilter);
        }
        if (filters.discriminationFilter) {
            nonBiomedicalQuery = nonBiomedicalQuery.where('nonbiomedical.discrimination').equals(filters.discriminationFilter);
        }
        if (filters.violenceFilter) {
            nonBiomedicalQuery = nonBiomedicalQuery.where('nonbiomedical.violence').equals(filters.violenceFilter);
        }

        // Executing queries
        let biomedicalResults = await biomedicalQuery.exec();
        let nonBiomedicalResults = await nonBiomedicalQuery.exec();

        let allResults = [...biomedicalResults, ...nonBiomedicalResults];

        return allResults;
    } catch (err) {
        console.error(err);
        throw err;
    }
};