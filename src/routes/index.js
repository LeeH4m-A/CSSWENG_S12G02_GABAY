/* TODO: Fix the routes */
import express from 'express';


// Import individual route modules
import signup from './signup.js';
import forgot_password from './password.js';
import login from './login.js';
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

/* TODO: Anything request that will change the database should be post */
router.use('/login', login);
router.use('/signup', signup);
router.use('/forgot_password', forgot_password);
router.use('/user', user); // has delete get request, change it to post
router.use('/patient', patient); // has delete get request, change it to post
router.use('/profile', profile);
router.use('/history', history); // Todo, make pagination a helper or middleware
router.use('/data', data); //use less lines, by using lists or something idk.. ill figure this out tmr

router.use('/dashboard', dashboard); //hellspawn do not touch

export default router;