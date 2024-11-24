// Import necessary modules for each calendar API
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';

// Google Calendar Setup
const googleCalendar = google.calendar('v3');

// Outlook Calendar Setup (Microsoft Graph API client setup)
const getOutlookClient = (auth) => {
    return Client.init({
        authProvider: (done) => done(null, auth) // Provide the auth token
    });
};

/**
 * Sync a Notion task with Google Calendar.
 * @param {Object} taskData - Task data to be synced.
 * @param {Object} auth - Auth object containing Google OAuth tokens.
 * @returns {Promise<Object>} - Synced Google Calendar event.
 */
export const syncGoogleCalendar = async (taskData, auth) => {
    try {
        const event = {
            summary: taskData.title,
            description: taskData.description,
            start: { dateTime: taskData.startDateTime, timeZone: 'UTC' },
            end: { dateTime: taskData.endDateTime, timeZone: 'UTC' },
        };

        const response = await googleCalendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error("Error syncing with Google Calendar:", error);
        return { error: "Failed to sync with Google Calendar" };
    }
};

/**
 * Sync a Notion task with Outlook Calendar.
 * @param {Object} taskData - Task data to be synced.
 * @param {Object} auth - Auth token for Microsoft Graph API.
 * @returns {Promise<Object>} - Synced Outlook Calendar event.
 */
export const syncOutlookCalendar = async (taskData, auth) => {
    try {
        const client = getOutlookClient(auth);

        const event = {
            subject: taskData.title,
            body: { contentType: "HTML", content: taskData.description },
            start: { dateTime: taskData.startDateTime, timeZone: 'UTC' },
            end: { dateTime: taskData.endDateTime, timeZone: 'UTC' },
        };

        const response = await client
            .api('/me/events')
            .post(event);

        return response;
    } catch (error) {
        console.error("Error syncing with Outlook Calendar:", error);
        return { error: "Failed to sync with Outlook Calendar" };
    }
};

/**
 * Main function to sync a Notion task with the selected calendar.
 * @param {Object} taskData - Task data to sync.
 * @param {String} calendarType - Type of calendar ("Google" or "Outlook").
 * @param {Object} auth - Authentication object for the calendar API.
 */
export const syncWithCalendar = async (taskData, calendarType, auth) => {
    if (calendarType === 'Google') {
        return await syncGoogleCalendar(taskData, auth);
    } else if (calendarType === 'Outlook') {
        return await syncOutlookCalendar(taskData, auth);
    } else {
        return { error: "Unsupported calendar type" };
    }
};
