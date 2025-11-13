import express from 'express';
import { eventModel, eventParticipantModel, userModel } from '../model/model.js';

const router = express.Router();

// GET route to display details for a specific event
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

        // Fetch participants for the event
        const participants = await eventParticipantModel.find({ eventId: eventId });
        let participantDetails = [];
        if (participants.length > 0) {
            const userIds = participants.map(p => p.userId);
            participantDetails = await userModel.find({ '_id': { $in: userIds } });
        }

        res.render('viewevents', {
            title: event.title,
            user: req.session.user,
            event: event,
            participants: participantDetails,
            totalParticipants: participantDetails.length,
            formattedStartDate: event.date_start ? new Date(event.date_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
            formattedEndDate: event.date_end ? new Date(event.date_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
        });

    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'An internal error occurred while fetching event details.'
        });
    }
});

export default router;