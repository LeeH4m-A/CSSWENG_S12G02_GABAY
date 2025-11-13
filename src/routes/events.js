import express from 'express';
import { eventModel } from '../model/model.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const events = await eventModel.find({});
        
        // Map events to add formatted dates and full event URLs
        const formattedEvents = events.map(event => {
            return {
                _id: event._id,
                title: event.title,
                description: event.description,
                category: event.category,
                location: event.location,
                organizer: event.organizer,
                event_status: event.event_status,
                // Format dates for display on the events list page
                formattedStartDate: event.date_start ? new Date(event.date_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                formattedEndDate: event.date_end ? new Date(event.date_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                viewUrl: `/viewevents/${event._id}` // Link to the new view event page
            };
        });

        res.render('events', {
            title: 'Events',
            user: req.session.user,
            events: formattedEvents,
            totalEvents: formattedEvents.length,
            message: req.query.message, // To display success messages from create event
            pageCss: 'events.css'
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.render('events', {
            title: 'Events',
            user: req.session.user,
            events: [],
            totalEvents: 0,
            error: 'Failed to load events.',
            pageCss: 'events.css'
        });
    }
});

export default router;