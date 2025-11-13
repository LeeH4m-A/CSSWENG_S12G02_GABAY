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
import events from './events.js';
import manageevents from './manageevents.js';
import viewevents from './viewevents.js';
import assignparticipants from './assignparticipants.js';
import { accessControl } from '../middlewares/get_session.js';
import { sidebarItems } from '../model/sidebarconfig.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(accessControl);

router.use((req, res, next) => {

  let page = req.path.split('/')[1] || 'index';
  res.locals.pageCss = `${page}.css`;
  res.locals.sidebarItems = sidebarItems;
  res.locals.currentPath = req.path;
  res.locals.user = req.session?.user;
  next();
});

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
        user: req.session.user
    });
});

/* TODO, path moment */


router.get('/exceljs', (req, res) => {
    const filePath = path.join(__dirname, '..', '..', 'node_modules', 'exceljs', 'dist', 'exceljs.min.js');
    res.sendFile(filePath);
});


router.use('/events', events); // events page
router.use('/events', viewevents); // view events page
router.use('/manageevents', manageevents); // manage events page
router.use('/assignparticipants', assignparticipants); // assign participants page

export default router;