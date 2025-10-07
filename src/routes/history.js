import express from 'express';

const router = express.Router();

// server for history log page
router.get('/history', async (req, res) => {
    try {
        const loginHistoryCollection = client.db("test").collection("loginhistories");
        const actionHistoryCollection = client.db("test").collection("actionhistories");

        const pageSize = 10; // number of records per page

        // get page number for login history
        const loginPage = parseInt(req.query.loginPage) || 1;
        const loginHistorySkip = (loginPage - 1) * pageSize;

        // get page number for action history
        const actionPage = parseInt(req.query.actionPage) || 1;
        const actionHistorySkip = (actionPage - 1) * pageSize;

        // get paginated login history sorted by most recent first
        const loginHistory = await loginHistoryCollection.find().sort({ lastLoginDateTime: -1 }).skip(loginHistorySkip).limit(pageSize).toArray();
        
        // get paginated action history sorted by most recent first
        const actionHistory = await actionHistoryCollection.find().sort({ actionDateTime: -1 }).skip(actionHistorySkip).limit(pageSize).toArray();

        res.render('history', {
            layout: 'index',
            title: 'History Log Page',
            user: {
                name: req.session.username,
                email: req.session.email,
                role: req.session.role,
                userIcon: req.session.userIcon
            },
            loginHistory: loginHistory,
            actionHistory: actionHistory,
            loginPage: loginPage,
            actionPage: actionPage,
            loginTotalPages: Math.ceil(await loginHistoryCollection.countDocuments() / pageSize),
            actionTotalPages: Math.ceil(await actionHistoryCollection.countDocuments() / pageSize)
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).send("Internal Server Error");
    }
});


export default router;