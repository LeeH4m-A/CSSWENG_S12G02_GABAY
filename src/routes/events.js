import express from 'express';
import { eventModel } from '../model/model.js';
import { eventParticipantModel } from '../model/model.js';

const router = express.Router();

// simple redirect based on role
router.get('/', (req, res) => {
    const user = req.session.user;
    
    if (user.role === 'Data Encoder' || user.role === 'Data Manager') {
        res.redirect('/events/manage');
    } else {
        res.redirect('/events/myevents');
    }
});

// route for managing events
router.get('/manage', async (req, res) => {
    try {
        const user = req.session.user;

        // security check
        if (user.role !== 'Data Encoder' && user.role !== 'Data Manager') {
            return res.redirect('/events/myevents');
        }

        // filter logic
        const searchQuery = req.query.search || '';
        const statusFilter = req.query.status || 'all';
        const sortMode = req.query.sort || 'name_asc';

        // build filter object
        const filter = {};

        if (searchQuery) {
            filter.title = { $regex: searchQuery, $options: 'i' };
        }

        if (statusFilter && statusFilter !== 'all') {
            filter.event_status = statusFilter;
        }

        // determine sorting logic
        const sortOptions = {};
        if (sortMode === 'name_desc') {
            sortOptions.title = -1; // Z-A
        } else {
            sortOptions.title = 1;  // A-Z (Default)
        }

        // fetch from DB
        const events = await eventModel.find(filter).sort(sortOptions);

        // set a layout for event cards
        const formattedEvents = events.map(event => {
            return {
                _id: event._id,
                title: event.title,
                description: event.description,
                category: event.category,
                location: event.location,
                organizer: event.organizer,
                event_status: event.event_status,
                // Date Formatting Logic
                formattedStartDate: event.date_start ? new Date(event.date_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                formattedEndDate: event.date_end ? new Date(event.date_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
                viewUrl: `/viewevents/${event._id}`
            };
        });

        // render events view
        res.render('events', {
            title: 'Events',
            user: user,
            isEncoder: true,
            events: formattedEvents,
            totalEvents: formattedEvents.length,
            searchQuery: searchQuery,
            currentStatus: statusFilter,
            currentSort: sortMode
        });

    } catch (error) {
        console.error('Error fetching managed events:', error);
        res.render('events', {
            title: 'Events',
            user: req.session.user,
            events: [],
            error: 'Failed to load events.'
        });
    }
});

// route for checking user's events
router.get('/myevents', async (req, res) => {
    try {
        const user = req.session.user;

        // get participations (events user is assigned to)
        const participations = await eventParticipantModel.find({ userId: user._id })
            .populate('eventId'); 

        // get events from participations
        let events = participations
            .map(p => p.eventId)
            .filter(event => event !== null); // Safety check in case an event was deleted

        // search filter
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            events = events.filter(event => searchRegex.test(event.title));
        }

        // show events by start date ascending
        events.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        // set a layout for event cards
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
                formattedEndDate: event.date_end ? new Date(event.date_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
            };
        });

        // categorize events    
        const incomingEvents = formattedEvents.filter(e => e.event_status === 'Scheduled');
        const ongoingEvents = formattedEvents.filter(e => e.event_status === 'Ongoing');
        const completedEvents = formattedEvents.filter(e => e.event_status === 'Completed');

        const totalEvents = formattedEvents.length;
        const totalOngoing = ongoingEvents.length;
        const totalUpcoming = incomingEvents.length;
        const totalCompleted = completedEvents.length;

        // render myevents view
        res.render('myevents', {
            title: 'My Events',
            user: user,
            incomingEvents: incomingEvents,
            ongoingEvents: ongoingEvents,
            completedEvents: completedEvents,
            totalEvents: totalEvents,
            totalOngoing: totalOngoing,
            totalUpcoming: totalUpcoming,
            totalCompleted: totalCompleted,
            searchQuery: req.query.search || ''
        });

    } catch (error) {
        console.error('Error loading my events:', error);
        res.render('error', { message: 'Could not load your events.' });
    }
});

export default router;