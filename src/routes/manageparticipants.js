import express from 'express';
import { eventModel, userModel, eventParticipantModel } from '../model/model.js';

const router = express.Router();

// GET route to show the manage participants page (for BOTH modes)
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        // Get the mode from the URL query, default to 'assign'
        const mode = req.query.mode || 'assign'; 

        if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).render('error', {
                title: 'Event Not Found',
                user: req.session.user,
                message: 'Invalid Event ID format.'
            });
        }

        const event = await eventModel.findById(eventId);

        if (!event) {
            return res.status(404).render('error', {
                title: 'Event Not Found',
                user: req.session.user,
                message: 'The event you are looking for does not exist.'
            });
        }

        let usersToList = [];
        let pageTitle = '';
        let modeIsAssign = true; // Flag for Handlebars

        // Fetch all users and assigned user IDs *once*
        const allUsers = await userModel.find({});
        const assignedParticipants = await eventParticipantModel.find({ eventId: eventId }).populate('userId');
        const assignedUserIds = assignedParticipants.map(p => p.userId._id.toString());

        if (mode === 'assign') {
            // --- ASSIGN MODE ---
            pageTitle = 'Assign Participants';
            modeIsAssign = true;
            
            // Filter out users who are already assigned
            usersToList = allUsers.filter(user => !assignedUserIds.includes(user._id.toString()));

        } else {
            // --- REMOVE MODE ---
            pageTitle = 'Remove Participants';
            modeIsAssign = false;
            
            // Get the full user objects for ONLY assigned participants
            usersToList = assignedParticipants.map(p => p.userId);
        }

        res.render('manageparticipants', { // Render the new HBS file
            title: pageTitle,
            user: req.session.user,
            event: event,
            users: usersToList,
            modeIsAssign: modeIsAssign, // Pass the flag to the template
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