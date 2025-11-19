import express from 'express';
import { eventModel, userModel, eventParticipantModel } from '../model/model.js';

const router = express.Router();

const allRoles = ['Member', 'Volunteer', 'Data Encoder', 'Data Manager'];

router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        
        const mode = req.query.mode || 'assign';
        const searchQuery = req.query.search || '';
        const sortMode = req.query.sort || 'name_asc'; // Default sort
        const roleFilter = req.query.role || 'all';   // Default filter

        if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).render('error', {
                title: 'Page Not Found',
                user: req.session.user,
                message: 'The page you are looking for does not exist.'
            });
        }

        const event = await eventModel.findById(eventId);
        if (!event) {
            // If no event is found, render a 404 or error page
            return res.status(404).render('404'); 
        }

        let usersToList = [];
        let pageTitle = '';
        let modeIsAssign = true;

        const allUsers = await userModel.find({});
        const assignedParticipants = await eventParticipantModel.find({ eventId: eventId }).populate('userId');
        const assignedUserIds = assignedParticipants.map(p => p.userId._id.toString());

        if (mode === 'assign') {
            pageTitle = 'Assign Participants';
            modeIsAssign = true;
            usersToList = allUsers.filter(user => !assignedUserIds.includes(user._id.toString()));
        } else {
            pageTitle = 'Remove Participants';
            modeIsAssign = false;
            usersToList = assignedParticipants.map(p => p.userId);
        }
        let processedUsers = usersToList;
        if (searchQuery) {
            processedUsers = processedUsers.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (roleFilter && roleFilter !== 'all') {
            processedUsers = processedUsers.filter(user => 
                user.role === roleFilter
            );
        }

        processedUsers.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            switch (sortMode) {
                case 'name_desc':
                    return nameB.localeCompare(nameA);
                case 'name_asc':
                default:
                    return nameA.localeCompare(nameB);
            }
        });

        res.render('manageparticipants', {
            title: pageTitle,
            user: req.session.user,
            event: event,
            users: processedUsers,     
            modeIsAssign: modeIsAssign,
            searchQuery: searchQuery,   
            currentSort: sortMode, 
            currentRoleFilter: roleFilter, 
            allRoles: allRoles         
        });

    } catch (error) {
        console.error('Error fetching data for participant management:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'An internal error occurred.'
        });
    }
});

router.post('/assign/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        let { userIds } = req.body;

        if (!userIds) {
            // Redirect back to assign mode
            return res.redirect(`/manageparticipants/${eventId}?mode=assign&message=No participants selected.`);
        }

        if (!Array.isArray(userIds)) {
            userIds = [userIds];
        }

        const participantDocs = userIds.map(userId => ({
            eventId: eventId,
            userId: userId
        }));

        await eventParticipantModel.insertMany(participantDocs, { ordered: false });

        res.redirect(`/viewevents/${eventId}?message=Participants assigned successfully.`);

    } catch (error) {
        console.error('Error assigning participants:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'An error occurred while assigning participants.'
        });
    }
});

router.post('/remove/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        let { userIds } = req.body;

        if (!userIds) {
            // Redirect back to remove mode
            return res.redirect(`/manageparticipants/${eventId}?mode=remove&message=No participants selected.`);
        }

        if (!Array.isArray(userIds)) {
            userIds = [userIds];
        }

        // Use deleteMany with the $in operator to remove all selected users
        await eventParticipantModel.deleteMany({
            eventId: eventId,
            userId: { $in: userIds }
        });

        res.redirect(`/viewevents/${eventId}?message=Participants removed successfully.`);

    } catch (error) {
        console.error('Error removing participants:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'An error occurred while removing participants.'
        });
    }
});


export default router;