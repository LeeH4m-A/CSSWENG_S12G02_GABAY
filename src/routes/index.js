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
import { access_control } from '../middlewares/get_session.js';


const router = express.Router();

router.use(access_control);
// server starts at index and login

/* TODO: might be better if there's a home page */
router.get('/', (req, res) => {
  res.redirect('/login');
});

router.use('/login', login);
router.use('/signup', signup);
router.use('/forgot_password', forgot_password);

/* TODO: Anything request that will change the database should be post */
/* Handlebars uses href... and the changing to forms is tricky (im lazy),  I'll keep it as is for now */
/* Will be changing it to forms next sprint */

router.use('/user', user); // has delete get request, change it to post 
router.use('/patient', patient); // has delete get request, change it to post
router.use('/profile', profile);  // add confirmation

router.use('/history', history); // Todo, make pagination a helper or middleware
router.use('/data', data); //use less lines, by using lists or something idk.. ill figure this out tmr

router.use('/dashboard', dashboard); //hellspawn do not touch

/* TODO: Might be better to POST this, keep as is for now */
// server to log out
router.get('/logout', (req,resp) => {
    req.session.destroy((err) => {
        resp.redirect('/');
    });

})


/* TODO: read up on res.locals */
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

/* TODO, path moment */
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

export default router;