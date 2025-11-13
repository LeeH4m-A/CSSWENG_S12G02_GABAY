import express from 'express';
import { eventModel } from '../model/model.js';
import { formatDateForInput } from '../helpers/dateformat.js';

const router = express.Router();

// GET route to display the create event form
router.get('/', (req, res) => {
    res.render('manageevents', {
        title: 'Create Event',
        user: req.session.user,
        event: {} // Add empty event object to prevent undefined errors
    });
});

router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).render('error', {
                title: 'Page Not Found',
                user: req.session.user,
                message: 'The page you are looking for does not exist.'
            });
        }

        const event = await eventModel.findById(eventId); // Make sure eventModel is imported

        if (!event) {
            // If no event is found, render a 404 or error page
            return res.status(404).render('404'); 
        }

        const eventForForm = {
            ...event.toObject(), // Convert Mongoose doc to plain object
            date_start: formatDateForInput(event.date_start),
            date_end: formatDateForInput(event.date_end),
        };

        // Render the manageevents.hbs form and pass the event data
        res.render('manageevents', {
            title: 'Edit Event',
            user: req.session.user,
            event: eventForForm // Pass the fetched event to pre-fill the form
        });

    } catch (error) {
        console.error('Error fetching event for edit:', error);
        res.status(500).render('error', {
            title: 'Error',
            user: req.session.user,
            message: 'Failed to load event for editing.'
        });
    }
});

// POST route to handle event creation
router.post('/createevent', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.title || !req.body.location?.venue || !req.body.date_start || 
            !req.body.date_end || !req.body.organizer) {
            throw new Error('Missing required fields');
        }

        const dateStart = new Date(req.body.date_start);
        const dateEnd = new Date(req.body.date_end);
        if (isNaN(dateStart) || isNaN(dateEnd)) {
            throw new Error('Invalid date format');
        }
        if (dateStart > dateEnd) {
            throw new Error('Start date must be before or equal to end date');
        }
        
        // Create new event instance
        const newEvent = new eventModel({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            location: {
                venue: req.body.location.venue,
                barangay: parseInt(req.body.location.barangay),
                city: req.body.location.city || 'Caloocan'
            },
            date_start: new Date(req.body.date_start),
            date_end: new Date(req.body.date_end),
            organizer: req.body.organizer,
            event_status: req.body.event_status || 'Scheduled'
        });

        await newEvent.save();
        res.redirect('/events?message=Event%20created%20successfully');

    } catch (error) {
        res.render('manageevents', {
            title: 'Create Event',
            user: req.session.user,
            error: error.message || 'Failed to create event',
            event: req.body // Preserve form data
        });
    }
});

router.post('/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        
        if (!req.body.title || !req.body.location?.venue || !req.body.date_start || 
            !req.body.date_end || !req.body.organizer) {
            throw new Error('Missing required fields');
        }

        const dateStart = new Date(req.body.date_start);
        const dateEnd = new Date(req.body.date_end);
        if (isNaN(dateStart) || isNaN(dateEnd)) {
            throw new Error('Invalid date format');
        }
        if (dateStart > dateEnd) {
            throw new Error('Start date must be before or equal to end date');
        }

        const updatedEvent = await eventModel.findByIdAndUpdate(
            eventId,
            {
                ...req.body,
                date_start: new Date(req.body.date_start), 
                date_end: new Date(req.body.date_end)   
            },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).render('404');
        }

        res.redirect(`/viewevents/${updatedEvent._id}?message=Event%20updated%20successfully`); 
    } catch (error) {
        
        const eventForForm = {
            ...req.body,
            _id: eventId,
            date_start: formatDateForInput(req.body.date_start),
            date_end: formatDateForInput(req.body.date_end),
        };

        res.render('manageevents', {
            title: 'Edit Event',
            user: req.session.user,
            error: 'Failed to save changes. Please check the form.',
            event: eventForForm
        });
    }
});

export default router;