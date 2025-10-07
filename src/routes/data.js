import express from 'express';

import filterPatients from '../helpers/filter.js';
const router =express.Router();
// server for data log page
router.get('/', async (req, res) => {
    try {
        const pageSize = 10;
        const biomedicalPage = parseInt(req.query.biomedicalPage) || 1;
        const nonBiomedicalPage = parseInt(req.query.nonBiomedicalPage) || 1;

        const { bioGenderFilter, bioFromDateFilter, bioToDateFilter, locationFilter, ageRangeFilter, 
                testedBeforeFilter, testResultFilter, reasonFilter, kvpFilter, linkageFilter, nonBioGenderFilter, 
                nonBioFromDateFilter, nonBioToDateFilter, stigmaFilter, discriminationFilter, violenceFilter } = req.query;

        const filters = {
            bioGenderFilter,
            bioFromDateFilter,
            bioToDateFilter,
            locationFilter,
            ageRangeFilter,
            testedBeforeFilter,
            testResultFilter,
            reasonFilter,
            kvpFilter,
            linkageFilter,
            nonBioGenderFilter,
            nonBioFromDateFilter, 
            nonBioToDateFilter,
            stigmaFilter,
            discriminationFilter,
            violenceFilter
        };

        const filteredPatients = await filterPatients(filters);

        const biomedicalPatients = filteredPatients.filter(patient => patient.data_type === 'Biomedical');
        const nonBiomedicalPatients = filteredPatients.filter(patient => patient.data_type === 'Nonbiomedical');

        const paginatedBiomedicalPatients = biomedicalPatients.slice((biomedicalPage - 1) * pageSize, biomedicalPage * pageSize);
        const paginatedNonBiomedicalPatients = nonBiomedicalPatients.slice((nonBiomedicalPage - 1) * pageSize, nonBiomedicalPage * pageSize);

        const biomedicalCount = biomedicalPatients.length;
        const nonBiomedicalCount = nonBiomedicalPatients.length;

        res.render('data', { 
            layout: 'index',
            title: 'Data Log Page',
            user: {
                name: req.session.username,
                email: req.session.email,
                role: req.session.role,
                userIcon: req.session.userIcon
            },
            paginatedBiomedicalPatients, 
            paginatedNonBiomedicalPatients,
            biomedicalCount,
            nonBiomedicalCount,
            biomedicalPage,
            nonBiomedicalPage,
            biomedicalTotalPages: Math.ceil(biomedicalCount / pageSize),
            nonBiomedicalTotalPages: Math.ceil(nonBiomedicalCount / pageSize)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;