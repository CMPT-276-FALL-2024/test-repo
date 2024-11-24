import { syncGoogleCalendar, syncOutlookCalendar, syncWithCalendar } from '/CalAPI';

// Mock the external libraries for Google and Microsoft
jest.mock('googleapis', () => ({
    google: {
        calendar: jest.fn(() => ({
            events: {
                insert: jest.fn().mockImplementation(({ auth, resource }) => {
                    if (!auth || !resource) throw new Error("Auth or event data missing");
                    return { data: { id: '123', summary: resource.summary } };
                })
            }
        }))
    }
}));

jest.mock('@microsoft/microsoft-graph-client', () => ({
    Client: {
        init: jest.fn(() => ({
            api: jest.fn(() => ({
                post: jest.fn(async (event) => {
                    if (!event.subject) throw new Error("Event data is invalid");
                    return { id: '456', subject: event.subject };
                })
            }))
        }))
    }
}));

describe('syncGoogleCalendar', () => {
    it('should sync task data with Google Calendar successfully', async () => {
        const taskData = {
            title: 'Test Event',
            description: 'Description for test event',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = { token: 'valid-auth-token' };

        const result = await syncGoogleCalendar(taskData, auth);
        expect(result).toHaveProperty('id', '123');
        expect(result).toHaveProperty('summary', 'Test Event');
    });

    it('should return an error when auth is missing', async () => {
        const taskData = {
            title: 'Test Event',
            description: 'Description for test event',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = null;

        const result = await syncGoogleCalendar(taskData, auth);
        expect(result).toHaveProperty('error', 'Failed to sync with Google Calendar');
    });
});

describe('syncOutlookCalendar', () => {
    it('should sync task data with Outlook Calendar successfully', async () => {
        const taskData = {
            title: 'Outlook Test Event',
            description: 'Description for outlook test event',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = 'valid-auth-token';

        const result = await syncOutlookCalendar(taskData, auth);
        expect(result).toHaveProperty('id', '456');
        expect(result).toHaveProperty('subject', 'Outlook Test Event');
    });

    it('should return an error when task data is invalid', async () => {
        const taskData = {
            title: '',
            description: '',
            startDateTime: '',
            endDateTime: '',
        };
        const auth = 'valid-auth-token';

        const result = await syncOutlookCalendar(taskData, auth);
        expect(result).toHaveProperty('error', 'Failed to sync with Outlook Calendar');
    });
});

describe('syncWithCalendar', () => {
    it('should call syncGoogleCalendar for "Google" calendar type', async () => {
        const taskData = {
            title: 'Google Event',
            description: 'Testing with Google Calendar',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = { token: 'valid-auth-token' };

        const result = await syncWithCalendar(taskData, 'Google', auth);
        expect(result).toHaveProperty('id', '123');
    });

    it('should call syncOutlookCalendar for "Outlook" calendar type', async () => {
        const taskData = {
            title: 'Outlook Event',
            description: 'Testing with Outlook Calendar',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = 'valid-auth-token';

        const result = await syncWithCalendar(taskData, 'Outlook', auth);
        expect(result).toHaveProperty('id', '456');
    });

    it('should return an error for unsupported calendar types', async () => {
        const taskData = {
            title: 'Invalid Event',
            description: 'This should not sync',
            startDateTime: '2024-11-08T10:00:00Z',
            endDateTime: '2024-11-08T11:00:00Z',
        };
        const auth = { token: 'valid-auth-token' };

        const result = await syncWithCalendar(taskData, 'InvalidType', auth);
        expect(result).toHaveProperty('error', 'Unsupported calendar type');
    });
});
