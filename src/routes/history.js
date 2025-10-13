import express from 'express';
import { loginHistoryModel, actionHistoryModel } from '../model/model.js';
import { paginateModelView } from '../helpers/pagination.js';

const router = express.Router();


/* PROBLEM: if a user clicks page 2 of action history, it resets login history back to page 1*/
/* TODO: Either we split this to two page, or we use ajax/fetch for now we keep it as is*/
/* Keep it in session or something idk */

// server for history log page
router.get('/',
    async (req, res) => {
    try {
        const limit = 10;

        const loginPage = parseInt(req.query.loginPage) || 1;
        const actionPage = parseInt(req.query.actionPage) || 1;

        await paginateModelView(res, loginHistoryModel, loginPage, limit, 'lastLoginDateTime', 'loginHistory');
        await paginateModelView(res, actionHistoryModel, actionPage, limit, 'actionDateTime', 'actionHistory');

        res.render('history', {
            layout: 'index',
            title: 'History Log Page',
            user: req.session.user,
            
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;