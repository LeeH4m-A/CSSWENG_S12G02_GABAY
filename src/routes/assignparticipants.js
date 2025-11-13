import express from 'express';
import { eventModel, userModel, eventParticipantModel } from '../model/model.js';

const router = express.Router();

// GET route to show the assign participants page
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

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

        // Fetch all users
        const allUsers = await userModel.find({});

        // Fetch IDs of users already assigned to the event
        const assignedParticipants = await eventParticipantModel.find({ eventId: eventId });
        const assignedUserIds = assignedParticipants.map(p => p.userId.toString());

        // Filter out users who are already assigned
        const availableUsers = allUsers.filter(user => !assignedUserIds.includes(user._id.toString()));

        res.render('assignparticipants', {
            title: 'Assign Participants',
            user: req.session.user,
            event: event,
            users: availableUsers,
            pageCss: 'assignparticipants.css'
        });

    } catch (error) {
        console.error('Error fetching data for participant assignment:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'An internal error occurred.'
        });
    }
});

// POST route to handle assigning participants
router.post('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        let { userIds } = req.body;

        if (!userIds) {
            return res.redirect(`/assignparticipants/${eventId}?message=No participants selected.`);
        }

        // If only one user is selected, userIds will be a string, so convert it to an array
        if (!Array.isArray(userIds)) {
            userIds = [userIds];
        }

        for (const userId of userIds) {
            // Check if the user is already a participant
            const existingParticipant = await eventParticipantModel.findOne({ eventId: eventId, userId: userId });

            if (!existingParticipant) {
                const newParticipant = new eventParticipantModel({
                    eventId: eventId,
                    userId: userId
                });
                await newParticipant.save();
            }
        }

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

export default router;
