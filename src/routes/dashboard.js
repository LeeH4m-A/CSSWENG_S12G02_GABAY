/* TODO: Fix the export function */

import express from 'express';
import ExcelJS from 'exceljs';

import { addDataToSheet, formatSheetHeaders } from '../helpers/sheet.js';
import { patientModel } from '../model/model.js';
const router = express.Router();

// server for dashboard page
router.get('/', async (req, resp) => {
    try {
        // get db collection
        

        // retrieve statistics from the patient collection
        const totalPatientsTested = await patientModel.countDocuments();
        const biomedicalPatientsTested = await patientModel.countDocuments({ data_type: 'Biomedical' });
        const nonbiomedicalPatientsTested = await patientModel.countDocuments({ data_type: 'Nonbiomedical' });
        const positivePatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Positive', data_type: 'Biomedical' });
        const negativePatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Negative', data_type: 'Biomedical' });
        const dnkPatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Do Not Know', data_type: 'Biomedical' });

        //getting available years
        const patient = await patientModel.find();
        const year = patient.map(({date_encoded}) => date_encoded).map(function(date){return date.getFullYear()});
        
        resp.render('dashboard', {
            layout: 'index',
            title: 'Dashboard Page',
            user: {
                name: req.session.username,
                email: req.session.email,
                role: req.session.role,
                userIcon: req.session.userIcon
            },
            statistics: {
                totalPatientsTested: totalPatientsTested,
                biomedicalPatientsTested: biomedicalPatientsTested,
                nonbiomedicalPatientsTested: nonbiomedicalPatientsTested,
                positivePatientsTested: positivePatientsTested,
                negativePatientsTested: negativePatientsTested,
                dnkPatientsTested: dnkPatientsTested
            },
            year: year.filter((item,index) => year.indexOf(item) === index).sort((a,b)=>b-a)
        });
    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        resp.status(500).send("Internal Server Error");
    }
});

// server to get data for the dashboard
router.get('/data', async (req, resp) => {
    try {
        const quarter = parseInt(req.query.quarter);
        const monthly = parseInt(req.query.monthly);
        const yearly = parseInt(req.query.yearly);

        // if there is monthly
        const filterMonth = monthly > 0 || monthly < 13?
        [
            {     
                $match: {
                    $expr:{$eq: ["$filterMonth",monthly]}
                }
            }
        ]
        : [];

        const filterYear = !isNaN(yearly)?
        [
            {     
                $match: {
                    $expr:{$eq: ["$filterYear",yearly]}
                }
            }
        ]
        : [];
        let filterQuarter = [];
        if(quarter){
            let months = [0,0,0];
        
            switch (quarter){
                case 1:
                    months = [1,2,3];
                    break;
                case 2:
                    months = [4,5,6];
                    break;
                case 3:
                    months = [7,8,9];
                    break;
                case 4:
                    months = [10,11,12];
                    break;
            }
            filterQuarter = [
                {
                    $match: {
                        $or: [
                            { $expr: { $eq: ["$filterMonth", months[0]] } },
                            { $expr: { $eq: ["$filterMonth", months[1]] } },
                            { $expr: { $eq: ["$filterMonth", months[2]] } }
                        ]
                    }
                }
            ]
        }

        const data = await patientModel.aggregate([
            {
                $addFields: {
                    filterMonth: {$month:"$date_encoded"},
                    filterYear: {$year:"$date_encoded"}
                }
            },
            ...filterMonth,
            ...filterYear,
            ...filterQuarter,
            {$facet: {
                genderTestResult: 
                [
                    {
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result"},
                            count: { $sum: 1 } 
                        }
                    }
                ],
                
                reason: 
                [   
                    { 
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result", reason: "$biomedical.reason" }, 
                            count: { $sum: 1 } 
                        } 
                    }
                ],

                kvp: 
                [   
                    { 
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result", kvp: "$biomedical.kvp" }, 
                            count: { $sum: 1 } 
                        } 
                    }
                ],

                testedBefore: 
                [   
                    { 
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result", tested_before: "$biomedical.tested_before" }, 
                            count: { $sum: 1 } 
                        } 
                    }
                ],

                ageRange: 
                [   
                    { 
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result", age: "$biomedical.age_range" }, 
                            count: { $sum: 1 } 
                        } 
                    }
                ],

                linkage: 
                [
                    { 
                        $group: { 
                            _id: { gender: "$gender", test_result: "$biomedical.test_result", linkage: "$biomedical.linkage" }, 
                            count: { $sum: 1 } 
                        } 
                    }
                ],
                stigma: 
                [   
                    { 
                        $group: { 
                            _id: { gender: "$gender", stigma: "$nonbiomedical.stigma" }, 
                            count: { $sum: 1 } 
                        }
                    }
                ],

                discrimination: 
                [   
                    { 
                        $group: { _id: { gender: "$gender", discrimination: "$nonbiomedical.discrimination" }, 
                        count: { $sum: 1 } 
                        } 
                    }
                ],
                
                violence: 
                [   
                    { 
                        $group: { _id: { gender: "$gender", violence: "$nonbiomedical.violence" }, 
                        count: { $sum: 1 } 
                        } 
                    }
                ]
            }}
        ])


        resp.json({data: data[0]}); 
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        resp.status(500).json({ error: "Internal Server Error" });
    }
});


// server for exporting data to excel sheet
router.get('/export', async (req, res) => {
    try {
        // fetch all patients
        const patients = await patientModel.find().exec();
        const totalPatientsTested = await patientModel.countDocuments();
        const biomedicalPatients = patients.filter(patient => patient.data_type === 'Biomedical');
        const nonBiomedicalPatients = patients.filter(patient => patient.data_type === 'Nonbiomedical');
        const positivePatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Positive', data_type: 'Biomedical' });
        const negativePatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Negative', data_type: 'Biomedical' });
        const dnkPatientsTested = await patientModel.countDocuments({ 'biomedical.test_result': 'Do Not Know', data_type: 'Biomedical' });

        // calculate totals
        const biomedicalCount = biomedicalPatients.length;
        const nonBiomedicalCount = nonBiomedicalPatients.length;

        // create excel workbook
        const workbook = new ExcelJS.Workbook();

        // biomedical Sheet
        const biomedicalSheet = workbook.addWorksheet('Biomedical Records');
        formatSheetHeaders(biomedicalSheet, 'Biomedical Records');
        addDataToSheet(biomedicalSheet, biomedicalPatients, true);

        // bonbiomedical Sheet
        const nonBiomedicalSheet = workbook.addWorksheet('Nonbiomedical Records');
        formatSheetHeaders(nonBiomedicalSheet, 'Nonbiomedical Records');
        addDataToSheet(nonBiomedicalSheet, nonBiomedicalPatients, false);

        // statistics Sheet
        const statisticsSheet = workbook.addWorksheet('Statistics');
        formatSheetHeaders(statisticsSheet, 'Statistics');
        statisticsSheet.addRow(['Total Patients Tested', totalPatientsTested]);
        statisticsSheet.addRow(['Total Biomedical Records', biomedicalCount]);
        statisticsSheet.addRow(['Total Nonbiomedical Records', nonBiomedicalCount]);
        statisticsSheet.addRow([]);
        statisticsSheet.addRow(['Total Biomedical Positive Patients Tested', positivePatientsTested]);
        statisticsSheet.addRow(['Total Biomedical Negative Patients Testeds', negativePatientsTested]);
        statisticsSheet.addRow(['Total Biomedical Do Not Know Patients Tested', dnkPatientsTested]);

        // auto-size columns for all sheets
        [biomedicalSheet, nonBiomedicalSheet, statisticsSheet].forEach(sheet => {
            sheet.columns.forEach(column => {
                let maxWidth = 0;
                column.eachCell(cell => {
                    const cellTextLength = cell.value ? cell.value.toString().length : 0;
                    if (cellTextLength > maxWidth) {
                        maxWidth = cellTextLength;
                    }
                });
                column.width = maxWidth < 10 ? 10 : maxWidth + 2;
            });
        });

        // save the Excel file to the server
        const filePath = path.join(__dirname, 'GABAY Data Sheet.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // send the Excel file as a response
        res.download(filePath, 'GABAY Data Sheet.xlsx', err => {
            if (err) {
                console.error('Error downloading the file:', err);
                res.status(500).send('Internal Server Error');
            }

            // clean up the file after sending it
            fs.unlink(filePath, unlinkErr => {
                if (unlinkErr) {
                    console.error('Error deleting the file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        console.error('Error exporting dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;