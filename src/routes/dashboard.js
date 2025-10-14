import express from 'express';
import ExcelJS from 'exceljs';

import { addDataToSheet, formatSheetHeaders } from '../helpers/sheet.js';
import { patientModel } from '../model/model.js';
import { getDashboardStatistics } from '../helpers/statistics.js';
import { getQuarterFilter } from '../helpers/filter.js';
import { autoSizeSheetColumns } from '../helpers/sheet.js';
const router = express.Router();

// server for dashboard page
router.get('/', async (req, res) => {
    try {
        const { statistics, years } = await getDashboardStatistics();

        res.render('dashboard', {
            layout: 'index',
            title: 'Dashboard Page',
            user: req.session.user,
            statistics,
            year: years
        });
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).send('Internal Server Error');
    }
});

// server to get data for the dashboard
router.get('/data', async (req, res) => {
    try {
        const quarter = parseInt(req.query.quarter);
        const monthly = parseInt(req.query.monthly);
        const yearly = parseInt(req.query.yearly);

        // Filters
        const filterMonth = monthly >= 1 && monthly <= 12
            ? [{ $match: { $expr: { $eq: ['$filterMonth', monthly] } } }]
            : [];

        const filterYear = !isNaN(yearly)
            ? [{ $match: { $expr: { $eq: ['$filterYear', yearly] } } }]
            : [];

        const filterQuarter = getQuarterFilter(quarter);

        const bioFields = [ 'reason', 'kvp', 'tested_before','age_range', 'linkage' ];

        const nonBioFields = ['stigma', 'discrimination', 'violence'];

        const facets = {
            genderTestResult: [
                {
                    $group: {
                        _id: { gender: '$gender', test_result: '$biomedical.test_result' },
                        count: { $sum: 1 }
                    }
                }
            ]
        };

        bioFields.forEach(field => {
            facets[field] = [
                {
                    $group: {
                        _id: {
                            gender: '$gender',
                            test_result: '$biomedical.test_result',
                            [field]: `$biomedical.${field}`
                        },
                        count: { $sum: 1 }
                    }
                }
            ];
        });

        nonBioFields.forEach(field => {
            facets[field] = [
                {
                    $group: {
                        _id: {
                            gender: '$gender',
                            [field]: `$nonbiomedical.${field}`
                        },
                        count: { $sum: 1 }
                    }
                }
            ];
        });
        
        const data = await patientModel.aggregate([
            {
                $addFields: {
                    filterMonth: { $month: '$date_encoded' },
                    filterYear: { $year: '$date_encoded' }
                }
            },
            ...filterMonth,
            ...filterYear,
            ...filterQuarter,
            { $facet: facets }
        ]);

        res.json({ data: data[0] });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// server for exporting data to excel sheet
router.get('/export', async (req, res) => {
    try {
        const patients = await patientModel.find().exec();

        const totalPatientsTested = patients.length;
        const biomedicalPatients = patients.filter(p => p.data_type === 'Biomedical');
        const nonBiomedicalPatients = patients.filter(p => p.data_type === 'Nonbiomedical');

        const resultCounts = await patientModel.aggregate([
        { 
            $match: { data_type: 'Biomedical' } 
        },
        { 
            $group: { 
            _id: '$biomedical.test_result',
            count: { $sum: 1 }
            } 
        }
        ]);

        const counts = Object.fromEntries(resultCounts.map(r => [r._id, r.count]));

        const positiveCount = counts['Positive'] || 0;
        const negativeCount = counts['Negative'] || 0;
        const dnkCount = counts['Do Not Know'] || 0;

        const workbook = new ExcelJS.Workbook();

        // Biomedical
        const biomedicalSheet = workbook.addWorksheet('Biomedical Records');
        formatSheetHeaders(biomedicalSheet, 'Biomedical Records');
        addDataToSheet(biomedicalSheet, biomedicalPatients, true);

        // Nonbiomedical
        const nonBiomedicalSheet = workbook.addWorksheet('Nonbiomedical Records');
        formatSheetHeaders(nonBiomedicalSheet, 'Nonbiomedical Records');
        addDataToSheet(nonBiomedicalSheet, nonBiomedicalPatients, false);

        // Statistics
        const statisticsSheet = workbook.addWorksheet('Statistics');
        formatSheetHeaders(statisticsSheet, 'Statistics');
        statisticsSheet.addRows([
            ['Total Patients Tested', totalPatientsTested],
            ['Total Biomedical Records', biomedicalPatients.length],
            ['Total Nonbiomedical Records', nonBiomedicalPatients.length],
            [],
            ['Total Biomedical Positive Patients Tested', positiveCount],
            ['Total Biomedical Negative Patients Tested', negativeCount],
            ['Total Biomedical Do Not Know Patients Tested', dnkCount]
        ]);

        // Auto-size columns
        [biomedicalSheet, nonBiomedicalSheet, statisticsSheet].forEach(autoSizeSheetColumns);

        // Stream the workbook directly to client
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="GABAY Data Sheet.xlsx"'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;