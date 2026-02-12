import { google } from 'googleapis';
import Integration from '../models/Integration.js';

// Google Calendar Integration
export const createCalendarEvent = async (workspaceId, eventData) => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.calendar?.isConfigured || !integration?.calendar?.isActive) {
            console.warn('Calendar not configured for workspace:', workspaceId);
            return { success: false, error: 'Calendar not configured', gracefulFail: true };
        }

        // Initialize Google Calendar API
        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: integration.calendar.accessToken,
            refresh_token: integration.calendar.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: eventData.title,
            description: eventData.description,
            start: {
                dateTime: eventData.startTime,
                timeZone: eventData.timezone || 'UTC',
            },
            end: {
                dateTime: eventData.endTime,
                timeZone: eventData.timezone || 'UTC',
            },
            attendees: eventData.attendees?.map(email => ({ email })) || [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: integration.calendar.calendarId || 'primary',
            resource: event,
            sendUpdates: 'all',
        });

        console.log('✅ Calendar event created:', response.data.id);
        return {
            success: true,
            eventId: response.data.id,
            htmlLink: response.data.htmlLink,
        };

    } catch (error) {
        console.error('❌ Calendar event creation error:', error.message);
        // Graceful failure - don't break the core flow
        return {
            success: false,
            error: error.message,
            gracefulFail: true,
        };
    }
};

export const updateCalendarEvent = async (workspaceId, eventId, updates) => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.calendar?.isConfigured) {
            return { success: false, error: 'Calendar not configured', gracefulFail: true };
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: integration.calendar.accessToken,
            refresh_token: integration.calendar.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: updates.title,
            description: updates.description,
            start: updates.startTime ? {
                dateTime: updates.startTime,
                timeZone: updates.timezone || 'UTC',
            } : undefined,
            end: updates.endTime ? {
                dateTime: updates.endTime,
                timeZone: updates.timezone || 'UTC',
            } : undefined,
        };

        const response = await calendar.events.patch({
            calendarId: integration.calendar.calendarId || 'primary',
            eventId: eventId,
            resource: event,
            sendUpdates: 'all',
        });

        console.log('✅ Calendar event updated:', eventId);
        return { success: true, eventId: response.data.id };

    } catch (error) {
        console.error('❌ Calendar update error:', error.message);
        return { success: false, error: error.message, gracefulFail: true };
    }
};

export const deleteCalendarEvent = async (workspaceId, eventId) => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.calendar?.isConfigured) {
            return { success: false, error: 'Calendar not configured', gracefulFail: true };
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: integration.calendar.accessToken,
            refresh_token: integration.calendar.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: integration.calendar.calendarId || 'primary',
            eventId: eventId,
            sendUpdates: 'all',
        });

        console.log('✅ Calendar event deleted:', eventId);
        return { success: true };

    } catch (error) {
        console.error('❌ Calendar delete error:', error.message);
        return { success: false, error: error.message, gracefulFail: true };
    }
};

export const testCalendarConnection = async (accessToken, refreshToken) => {
    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Test by listing calendars
        const response = await calendar.calendarList.list();

        return {
            success: true,
            message: 'Calendar connection successful',
            calendars: response.data.items?.map(cal => ({
                id: cal.id,
                summary: cal.summary,
            })),
        };

    } catch (error) {
        console.error('Calendar test failed:', error);
        return { success: false, error: error.message };
    }
};
