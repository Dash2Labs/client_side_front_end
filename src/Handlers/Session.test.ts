import { Session } from './Session.js';
import Chat, { ChatObject } from './Chat.js';
import Feedback, { FeedbackObject } from './Feedback.js';
import History, { HistoryObject } from './History.js';
import Settings, { SettingsObject } from './Settings.js';
import User from '../Models/User.js';
import Communicator from './Communicator.js';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.js';
import SessionError from './Errors/SessionError.js';

jest.mock('./Chat.js');
jest.mock('./Feedback.js');
jest.mock('./History.js');
jest.mock('./Settings.js');
jest.mock('../Models/User.js');
jest.mock('./Communicator.js');
jest.mock('../constants.js');

describe('Session', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (constants as any).useauth = true;
        (constants as any).debug = false;
    });

    it('should initialize a session with a given session_id', () => {
        const session_id = 'test-session-id';
        const session = new Session(session_id);

        expect(session.session_id).toBe(session_id);
        expect(Communicator).toHaveBeenCalledWith(session_id, expect.any(String));
        expect(Chat).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Feedback).toHaveBeenCalledWith(expect.any(Communicator));
        expect(History).toHaveBeenCalledWith(expect.any(Communicator));
        expect(Settings).toHaveBeenCalledWith(expect.any(Communicator));
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
        (constants as any).useauth = false;
        (User as jest.Mock).mockImplementation(() => null);

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
    });
});