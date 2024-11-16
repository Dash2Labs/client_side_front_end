/* eslint-disable */
import { v4 as uuiv4 } from 'uuid';
import { expect, jest } from '@jest/globals';
import Session from '../Handlers/Session.ts';
import Chat, { ChatObject } from '../Handlers/Chat.ts';
import Feedback, { FeedbackObject } from '../Handlers/Feedback.ts';
import History, { HistoryObject } from '../Handlers/History.ts';
import Settings, { SettingsObject } from '../Handlers/Settings.ts';
import User from '../Models/User.ts';
import Communicator from '../Handlers/Communicator.ts';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.ts';
import { AxiosRequestHeaders } from 'axios';

jest.mock('../Handlers/Chat.ts');
jest.mock('../Handlers/Feedback.ts');
jest.mock('../Handlers/History.ts');
jest.mock('../Handlers/Settings.ts');
jest.mock('../Models/User.ts');
jest.mock('../Handlers/Communicator.ts');
jest.mock('../constants.js');

describe('Session', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (constants as any).useauth = false;
        (constants as any).debug = false;

        (User as jest.Mock).mockImplementation(() => {
            return {
                user_id: uuiv4(),
                photo: "photo",
                [Symbol.dispose]: jest.fn()
            };
        });
    });

    it('should initialize a session with a given session_id', () => {
        const session_id = uuiv4();
        const mockGetRequest = jest.spyOn(Communicator.prototype, 'getRequest').mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {headers: {} as AxiosRequestHeaders},
            data: { message: 'Hello' }
        });
        const mockPostRequest = jest.spyOn(Communicator.prototype, 'postRequest').mockResolvedValue({
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {headers: {} as AxiosRequestHeaders},
            data: { message: 'Hello' }
        });
        const session = new Session(session_id);
        jest.unmock('../Handlers/Chat.ts');
        expect(session.session_id).toBe(session_id);
        expect(Chat).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Feedback).toHaveBeenCalledWith(expect.any(Communicator));
        expect(History).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Settings).toHaveBeenCalledWith(expect.any(Communicator));
        mockGetRequest.mockRestore();
        mockPostRequest.mockRestore();
    });

    it('should initialize a session without a given session_id', () => {
        const session = new Session(undefined);

        expect(session.session_id).toBeDefined();
        expect(Communicator).toHaveBeenCalledWith(expect.any(String), expect.any(String));
        expect(Chat).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Feedback).toHaveBeenCalledWith(expect.any(Communicator));
        expect(History).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Settings).toHaveBeenCalledWith(expect.any(Communicator));
    });

    it('should throw an AuthorizationError if user is not authorized', () => {
        (constants as any).useauth = true;
        (User as jest.Mock).mockImplementation(() => {
            throw new AuthorizationError("User not authorized");
        });

        expect(() => new Session(undefined)).toThrow(AuthorizationError);
    });

    it('should send a chat message', () => {
        const session = new Session(undefined);
        const question: ChatObject = { question: 'Hello' };

        session.sendChat(question);

        expect(session['_chat'].sendQuestion).toHaveBeenCalledWith(question);
    });

    it('should send feedback', () => {
        const session = new Session(undefined);
        const feedback: FeedbackObject = { feedback: 'Good', feedbackId: '1', question: 'Hello', response: 'Hi', responseTime: 100 };

        session.sendFeedback(feedback);

        expect(session['_feedback'].sendFeedback).toHaveBeenCalledWith(feedback);
    });

    it('should get history', () => {
        const session = new Session(undefined);

        session.getHistory();

        expect(session['_history'].getHistory).toHaveBeenCalled();
    });

    it('should get settings', () => {
        const session = new Session(undefined);

        session.getSettings();

        expect(session['_settings'].getSettings).toHaveBeenCalled();
    });

    it('should set settings', () => {
        const session = new Session(undefined);
        const settings: SettingsObject = { client_settings: {}, user_settings: {} };

        session.setSettings(settings);

        expect(session['_settings'].setSettings).toHaveBeenCalledWith(settings);
    });

    it('should dispose all handlers', () => {
        const session = new Session(undefined);

        session[Symbol.dispose]();

        expect(session['_chat'][Symbol.dispose]).toHaveBeenCalled();
        expect(session['_feedback'][Symbol.dispose]).toHaveBeenCalled();
        expect(session['_history'][Symbol.dispose]).toHaveBeenCalled();
        expect(session['_user'][Symbol.dispose]).toHaveBeenCalled();
        expect(session['_communicator'][Symbol.dispose]).toHaveBeenCalled();
    })});