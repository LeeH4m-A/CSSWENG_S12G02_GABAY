import express from 'express';


const router = express.Router();


import { patientModel, actionHistoryModel } from '../model/model.js';

/* TODO: Make this POST */
// server for deleting a patient data record 
router.get('/delete/:id', async (req, res) => {
    try { 
        await patientModel.findByIdAndDelete(req.params.id);
        
        /* TODO: I bet we can make this a middleware, and pass in the "action" as a string */
        // insert action history for deleting patient record
        await actionHistoryModel.create({
            name: req.session.user.name,
            role: req.session.user.role,
            email: req.session.user.email,
            action: "Deleted patient record",
            actionDateTime: new Date()
        });
        res.redirect('/data');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// server for editing patient data record
router.get('/edit/:id', async (req, res) => {
    try {
        const patient = await patientModel.findById(req.params.id);
        res.json({ patient: patient });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/* TODO: save this poor route */
// server for updating a patient record
router.post('/edit/:id', async (req, res) => {
    try {
        const { gender, location, barangay, remarks, age_range, tested_before, test_result, reason, kvp, linkage, stigma, discrimination, violence } = req.body;
        await patientModel.findByIdAndUpdate(req.params.id, {
            gender: gender,
            'biomedical.location': location,
            'biomedical.barangay': barangay,
            'biomedical.remarks': remarks,
            'biomedical.age_range': age_range,
            'biomedical.tested_before': tested_before,
            'biomedical.test_result': test_result,
            'biomedical.reason': reason,
            'biomedical.kvp': kvp,
            'biomedical.linkage': linkage,
            'nonbiomedical.stigma': stigma,
            'nonbiomedical.discrimination': discrimination,
            'nonbiomedical.violence': violence
        });
        
        // insert action history for deleting patient record
        await actionHistoryModel.create({
            name: req.session.user.name,
            role: req.session.user.role,
            email: req.session.user.email,
            action: "Edited patient record",
            actionDateTime: new Date()
        });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// server to add new patient data to database
router.post('/add', async (req, res) => {
    const { data_type, gender, location, barangay, remarks, age,
        tested, result, linkage, stigma, discrimination, violence } = req.body;

    const reason_hiv = req.body['reason-hiv'];
    const vulnerable_population = req.body['vulnerable-population'];

    try {
        const patientData = {
            data_type: data_type,
            gender: gender,
            date_encoded: new Date(),
            encoder: req.session.user.name
        };

        if (data_type === 'Biomedical') {
            patientData.biomedical = {
                location: location,
                barangay: barangay,
                remarks: remarks,
                age_range: age,
                tested_before: tested,
                test_result: result,
                reason: reason_hiv,
                kvp: vulnerable_population,
                linkage: linkage
            };
        } else if (data_type === 'Nonbiomedical') {
            patientData.nonbiomedical = {
                stigma: stigma,
                discrimination: discrimination,
                violence: violence
            };
        }

        const newPatient = new patientModel(patientData);
        await newPatient.save();

        // insert action history
        
        await actionHistoryModel.create({
            name: req.session.user.name,
            role: req.session.user.role,
            email: req.session.user.email,
            icon: req.session.user.userIcon,
            action: "Add new patient record",
            actionDateTime: new Date()
        });

        console.log("Patient data successfully added");
        return res.redirect('/tracker?message=Patient Data Record added successfully');
    } catch (err) {
        console.error("Error adding patient data:", err);
        return res.status(500).send("Error adding patient data");
    }
});

export default router;
