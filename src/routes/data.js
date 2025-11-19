import express from 'express';
import createMedicalQueries from '../helpers/filter.js';
import { paginateQuery } from '../helpers/pagination.js';
/* TODO: Find a way to get all the filters from req.query smaller
   Dynamically build the query // ...trying to find a better way, but for now it's ight
   Paginate.
   Ship it off.
*/
const router = express.Router();
// server for data log page
router.get('/', async (req, res) => {
    try {
        const limit = 10;
        const { biomedicalPage = 1, nonBiomedicalPage = 1, ...queryFilters } = req.query;

        const { biomedicalQuery, nonBiomedicalQuery} = await createMedicalQueries(queryFilters);

        const bioResult = await paginateQuery(biomedicalQuery, biomedicalPage, limit, 'date_encoded');
        const paginatedBiomedicalPatients = bioResult.data;
        const biomedicalCount = bioResult.length;
        const biomedicalTotalPages = bioResult.total_pages;

        const nonBioResult = await paginateQuery(nonBiomedicalQuery, nonBiomedicalPage, limit, 'date_encoded');
        const paginatedNonBiomedicalPatients = nonBioResult.data;
        const nonBiomedicalCount = nonBioResult.length;
        const nonBiomedicalTotalPages = nonBioResult.total_pages

        res.render('data', { 
            layout: 'index',
            title: 'Data Log Page',
            user: req.session.user,
            paginatedBiomedicalPatients, 
            paginatedNonBiomedicalPatients,
            biomedicalCount,
            nonBiomedicalCount,
            biomedicalPage,
            nonBiomedicalPage,
            biomedicalTotalPages,
            nonBiomedicalTotalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;