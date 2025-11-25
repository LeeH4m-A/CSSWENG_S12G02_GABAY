import { eventModel } from '../model/model.js';

/**
 * Fetch all events with optional filtering
 * @returns { events }
 */
export async function getEvents() {
    const events = await eventModel.aggregate([
        {
            $project: {
                title: 1,
                organizer: 1,
                category: 1,
                date_start: 1,
                date_end: 1,
                event_status: 1,
                date_created: 1
            }
        },
        {
            $sort: { date_created: -1 } // Sort by most recent first
        }
    ]);

    return events;
}