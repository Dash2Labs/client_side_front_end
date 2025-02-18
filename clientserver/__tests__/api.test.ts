import request from 'supertest';
import express from 'express';
import api from '../routes/api.js';
import { constants } from '../__mocks__/constants.js';
import { handleResponse } from '../__mocks__/handleResponse.js';
import er from '../errors.js';
import { getSizeInBytes } from '../__mocks__/Utility.js';
import mockAxios from 'jest-mock-axios';
import xss from '../__mocks__/xss.js';

jest.mock('axios');
jest.mock('../common_imports.js');
jest.mock('../Utilities/Utility.js');
jest.mock('xss');

const app = express();
app.use(express.json());
app.use('/', api);

describe('API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    describe('POST /api/chat', () => {
        it('should return 400 if question is too long', async () => {
            getSizeInBytes.mockReturnValueOnce(2000);
            const res = await request(app).post('/api/chat').send({ question: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Question too long');
        });

        it('should return 400 if question contains invalid characters', async () => {
            xss.mockReturnValueOnce('invalid');
            const res = await request(app).post('/api/chat').send({ question: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid characters in question');
        });

        it('should return 400 if no question is provided', async () => {
            const res = await request(app).post('/api/chat').send({});
            expect(res.status).toBe(400);
            expect(res.text).toBe('No question provided');
        });

        it('should return 500 if server error occurs', async () => {
            mockAxios.post.mockRejectedValueOnce(new Error('Server error'));
            const res = await request(app).post('/api/chat').send({ question: 'test' });
            expect(res.status).toBe(500);
            expect(res.text).toBe(er.serverError);
        });

        it('should handle valid request', async () => {
            mockAxios.post.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).post('/api/chat').send({ question: 'test' });
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });
    });

    describe('POST /api/feedback', () => {
        it('should return 400 if feedback is too long', async () => {
            getSizeInBytes.mockReturnValueOnce(2000);
            const res = await request(app).post('/api/feedback').send({ feedback: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Feedback too long');
        });

        it('should return 400 if feedback contains invalid characters', async () => {
            xss.mockReturnValueOnce('invalid');
            const res = await request(app).post('/api/feedback').send({ feedback: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid characters in feedback');
        });

        it('should return 400 if no feedback is provided', async () => {
            const res = await request(app).post('/api/feedback').send({});
            expect(res.status).toBe(400);
            expect(res.text).toBe('No feedback provided');
        });

        it('should return 500 if server error occurs', async () => {
            mockAxios.post.mockRejectedValueOnce(new Error('Server error'));
            const res = await request(app).post('/api/feedback').send({ feedback: 'test' });
            expect(res.status).toBe(500);
            expect(res.text).toBe(er.serverError);
        });

        it('should handle valid request', async () => {
            mockAxios.post.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).post('/api/feedback').send({ feedback: 'test' });
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });
    });

    describe('GET /api/history', () => {
        it('should return 400 if request contains invalid characters', async () => {
            xss.mockReturnValueOnce('invalid');
            const res = await request(app).get('/api/history');
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid characters in history request');
        });

        it('should return 500 if server error occurs', async () => {
            mockAxios.get.mockRejectedValueOnce(new Error('Server error'));
            const res = await request(app).get('/api/history');
            expect(res.status).toBe(500);
            expect(res.text).toBe(er.serverError);
        });

        it('should handle valid request without auth', async () => {
            constants.useAuth = false;
            mockAxios.get.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).get('/api/history');
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });

        it('should handle valid request with auth', async () => {
            constants.useAuth = true;
            mockAxios.get.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).get('/api/history');
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });
    });

    describe('GET /api/settings', () => {
        it('should return 400 if request contains invalid characters', async () => {
            xss.mockReturnValueOnce('invalid');
            const res = await request(app).get('/api/settings');
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid characters in settings request');
        });

        it('should return 500 if server error occurs', async () => {
            mockAxios.get.mockRejectedValueOnce(new Error('Server error'));
            const res = await request(app).get('/api/settings');
            expect(res.status).toBe(500);
            expect(res.text).toBe(er.serverError);
        });

        it('should handle valid request', async () => {
            mockAxios.get.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).get('/api/settings');
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });
    });

    describe('POST /api/settings', () => {
        it('should return 400 if settings are too long', async () => {
            getSizeInBytes.mockReturnValueOnce(2000);
            const res = await request(app).post('/api/settings').send({ settings: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Settings too long');
        });

        it('should return 400 if settings contain invalid characters', async () => {
            xss.mockReturnValueOnce('invalid');
            const res = await request(app).post('/api/settings').send({ settings: 'test' });
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid characters in settings post request');
        });

        it('should return 400 if no settings are provided', async () => {
            const res = await request(app).post('/api/settings').send({});
            expect(res.status).toBe(400);
            expect(res.text).toBe('No settings provided');
        });

        it('should return 403 if auth is required but not provided', async () => {
            constants.useAuth = true;
            const res = await request(app).post('/api/settings').send({ settings: 'test' });
            expect(res.status).toBe(403);
            expect(res.text).toBe(er.userError);
        });

        it('should return 500 if server error occurs', async () => {
            constants.useAuth = true;
            mockAxios.post.mockRejectedValueOnce(new Error('Server error'));
            const res = await request(app).post('/api/settings').send({ settings: 'test' });
            expect(res.status).toBe(500);
            expect(res.text).toBe(er.serverError);
        });

        it('should handle valid request', async () => {
            constants.useAuth = true;
            mockAxios.post.mockResolvedValueOnce({ data: 'response' });
            const res = await request(app).post('/api/settings').send({ settings: 'test' });
            expect(res.status).toBe(200);
            expect(handleResponse).toHaveBeenCalled();
        });
    });
});