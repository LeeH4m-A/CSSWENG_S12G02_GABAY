import express from 'express';
import { eventModel } from '../model/model.js';

const router = express.Router();

router.get('/', (req, res) => {
    const user = req.session.user;
    
    if (user.role === 'Data Encoder' || user.role === 'Data Manager') {
        // If Admin, go to the Manage page
        res.redirect('/events/manage'); 
    } else {
        // If User, go to My Events
        res.redirect('/events/myevents');
    }
});


router.get('/manage', async (req, res) => {
    try {
        // 1. Extract Query Parameters
        const searchQuery = req.query.search || '';
        const statusFilter = req.query.status || 'all';
        const sortMode = req.query.sort || 'name_asc';

        // 2. Build the Database Filter
        const filter = {};

        // Search by Title (Case-insensitive regex)
        if (searchQuery) {
            filter.title = { $regex: searchQuery, $options: 'i' };
        }

        // Filter by Status
        if (statusFilter && statusFilter !== 'all') {
            filter.event_status = statusFilter;
        }

        // 3. Determine Sorting Logic (1 for A-Z, -1 for Z-A)
        const sortOptions = {};
        if (sortMode === 'name_desc') {
            sortOptions.title = -1; // Z-A
        } else {
            sortOptions.title = 1;  // A-Z (Default)
        }

        // 4. Fetch from DB with Filter and Sort applied
        const events = await eventModel.find(filter).sort(sortOptions);
        
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
                formattedStartDate: event.date_start ? new Date(event.date_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                formattedEndDate: event.date_end ? new Date(event.date_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                viewUrl: `/viewevents/${event._id}`
            };
        });

        // 5. Render with variables to keep inputs populated
        res.render('events', {
            title: 'Events',
            user: req.session.user,
            events: formattedEvents,
            totalEvents: formattedEvents.length,
            // Pass these back so the HTML knows what to show as "selected"
            searchQuery: searchQuery,
            currentStatus: statusFilter,
            currentSort: sortMode
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.render('events', {
            title: 'Events',
            user: req.session.user,
            events: [],
            totalEvents: 0,
            error: 'Failed to load events.'
        });
    }
});

export default router;