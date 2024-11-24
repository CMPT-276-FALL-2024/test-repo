import { fetchTasks, createTask, updateTask, deleteTask } from '../src/notionAPI';
import fetch from 'jest-fetch-mock';
//hi there
beforeEach(() => {
    fetch.resetMocks();
});

describe('Notion API functions', () => {
    const mockDatabaseId = 'mock-database-id';
    const mockPageId = 'mock-page-id';
    const mockTaskData = {
        Name: { title: [{ text: { content: 'Test Task' } }] },
        StartDate: { date: { start: '2024-01-01' } },
        EndDate: { date: { start: '2024-01-02' } }
    };

    it('fetches tasks from the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1', name: 'Sample Task' }] }));

        const tasks = await fetchTasks(mockDatabaseId);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/databases/mock-database-id/query'), {
            method: 'POST',
            headers: expect.any(Object)
        });
        expect(tasks).toEqual([{ id: '1', name: 'Sample Task' }]);
    });

    it('creates a new task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'new-task-id', properties: mockTaskData }));

        const response = await createTask(mockDatabaseId, mockTaskData);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pages'), {
            method: 'POST',
            headers: expect.any(Object),
            body: JSON.stringify({
                parent: { database_id: mockDatabaseId },
                properties: mockTaskData
            })
        });
        expect(response).toHaveProperty('id', 'new-task-id');
    });

    it('updates a task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: mockTaskData }));

        const response = await updateTask(mockPageId, mockTaskData);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
            method: 'PATCH',
            headers: expect.any(Object),
            body: JSON.stringify({ properties: mockTaskData })
        });
        expect(response).toHaveProperty('id', 'updated-task-id');
    });

    it('archives a task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'archived-task-id', archived: true }));

        const response = await deleteTask(mockPageId);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
            method: 'PATCH',
            headers: expect.any(Object),
            body: JSON.stringify({ archived: true })
        });
        expect(response).toHaveProperty('archived', true);
    });
});
