/* TODO: Fix the routes */
import express from 'express';


// Import individual route modules
import signup from './signup.js';
import password from './password.js';
import login from './login.js';
/* TODO: Combine those 3 to auth.js, once im done */

import dashboard from './dashboard.js';
import patient from './patient.js';
import history from './history.js';
import data from './data.js';
import user from './user.js';
import profile from './profile.js';


const router = express.Router();

// server starts at index and login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// server to log out
router.get('/logout', (req,resp) => {
    req.session.destroy((err) => {
        resp.redirect('/');
    });

})

// server for tracker page
router.get('/tracker', (req,resp) => {
    resp.render('tracker',{
        layout: 'index',
        title: 'Data Tracker Page',
        user: {
            name: req.session.username,
            email: req.session.email,
            role: req.session.role,
            userIcon: req.session.userIcon
        }
    });
});


// server for exporting charts to excel sheet
router.get('/exceljs', (req, res) => {
    const filePath = path.join(__dirname, 'node_modules', 'exceljs', 'dist', 'exceljs.min.js');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading ExcelJS file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(data);
    });
});



router.use('/login', login);
router.use('/signup', signup);
router.use('/dashboard', dashboard);
router.use('/patient', patient);
router.use('/profile', profile);
router.use('/history', history);
router.use('/data', data);
router.use('/patient', user);
router.use('/password', password);


export default router;