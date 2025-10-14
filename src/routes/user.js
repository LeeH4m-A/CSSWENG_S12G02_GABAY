import express from 'express';

import { userModel, actionHistoryModel } from '../model/model.js';
const router = express.Router();

// server for user data page
router.get('/', 
    async (req, res) => {
    try {
        const pageSize = 10;
        const userPage = parseInt(req.query.userPage) || 1;
        const roleFilter = req.query.role || '';

        let usersQuery = {};
        if (roleFilter) {
            usersQuery.role = roleFilter;
        }

        const users = await userModel.find(usersQuery).exec();
        const paginatedUsers = users.slice((userPage - 1) * pageSize, userPage * pageSize);
        const userCount = users.length;

        res.render('user', {
            layout: 'index',
            title: 'User Data Page',
            user: req.session.user,
            paginatedUsers,
            userCount,
            userPage,
            userTotalPages: Math.ceil(userCount / pageSize),
            roleFilter
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


/*TODO: THIS SHOULD BE POST WHAT !!*/
// server to delete a user in user data page
router.get('/delete/:id',
    async (req, res) => {
    try {
        const userToDelete = await userModel.findById(req.params.id);

        /* TODO: THIS COULD BE A MIDDLEWARE */
        // check if there's only one data manager
        const dataManagerCount = await userModel.countDocuments({ role: 'Data Manager' });
        if (dataManagerCount <= 1 && userToDelete.role === 'Data Manager') {
            return res.redirect('/user?error=There%20must%20be%20at%20least%20one%20Data%20Manager.');
        }

        
        if(req.session.user.name ===  userToDelete.name){
            return res.redirect('/user?error=You%20can%20not%20delete%20yourself.');
        }

        await userModel.findByIdAndDelete(req.params.id);


        // insert action history for deleting user record
        await actionHistoryModel.create({
            name: req.session.user.name,
            role: req.session.user.role,
            email: req.session.user.email,
            action: "Deleted user record",
            actionDateTime: new Date()
        });

        res.redirect('/user?message=User%20deleted%20successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// server to edit user's role in user data page
router.post('/edit', 
    async (req, res) => {
    try {
        const { userId, role } = req.body;

        // check if there's only one data manager
        const dataManagerCount = await userModel.countDocuments({ role: 'Data Manager' });
        const currentUser = await userModel.findById(userId);

        if (dataManagerCount <= 1 && currentUser.role === 'Data Manager' && role !== 'Data Manager') {
            return res.redirect('/user?error=There%20must%20be%20at%20least%20one%20Data%20Manager.');
        }

        if(req.session.user.name ===  currentUser.name){
            return res.redirect('/user?error=You%20can%20not%20edit%20your%20own%20role.');
        }

        await userModel.findByIdAndUpdate(userId, { role: role });

        
        // insert action history for updating user's role
        await actionHistoryModel.create({
            name: req.session.user.name,
            role: req.session.user.role,
            email: req.session.user.email,
            action: "Updated user's role",
            actionDateTime: new Date()
        });

        res.redirect('/user?message=Role%20updated%20successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


export default router;