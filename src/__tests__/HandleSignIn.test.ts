/* eslint-disable */
import Session from '../Handlers/Session.ts';
import SessionManager from '../Managers/Session.ts';
import HandleSignIn from '../Handlers/HandleSignIn.ts';

const defaultSessionId = "e7b8a6d4-3f2a-4b8a-9f3b-2d6a8e4f9c3e";

jest.mock('../Handlers/Chat.ts');
jest.mock('../Handlers/Feedback.ts');
jest.mock('../Handlers/History.ts');
jest.mock('../Handlers/Settings.ts');
jest.mock('../Models/User.ts');
jest.mock('../Handlers/Session.ts');
jest.mock('../Managers/Session.ts');
jest.mock('../Handlers/Communicator.ts');
jest.mock('../constants.js');

describe('HandleSignIn', () => {
    let handleSignIn: HandleSignIn;

    beforeEach(() => {
        jest.clearAllMocks();
        handleSignIn = new HandleSignIn(); 
        handleSignIn.emit = jest.fn();
        SessionManager.ManageSessions();         
    });

    it('should initialize with a session_id from cookie', () => {
        const sessionId = (handleSignIn as any)._session_id;
        expect(sessionId).toBe(defaultSessionId);
    });

    it('should sign in and create a new session if not already signed in', () => {
        jest.clearAllMocks();
        jest.unmock('../Handlers/Session.ts');
        const spy = jest.spyOn(SessionManager, 'addSession');
        handleSignIn.signIn();
        
        expect(Session).toHaveBeenCalledWith(defaultSessionId);
        expect(spy).toHaveBeenCalledWith(expect.any(Session));
        expect(handleSignIn['_session']).toBeInstanceOf(Session);
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedIn', expect.any(Session));
    });

    it('should sign out and clear the session', () => {
        const spyR = jest.spyOn(SessionManager, 'removeSession');
        handleSignIn.signIn();
        handleSignIn.session_id = defaultSessionId;
        expect(handleSignIn.session).toBeInstanceOf(Session);
        
        handleSignIn.signOut();

        expect(spyR).toHaveBeenCalledWith(defaultSessionId);
        const sessionId = (handleSignIn as any)._session_id;
        expect(handleSignIn.session).toBeUndefined();
        expect(sessionId).toBe('');
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedOut', undefined);
    });

    it('should not throw an error if sign out is called without an active session', () => {
        const spy = jest.spyOn(SessionManager, 'removeSession');
        expect(() => handleSignIn.signOut()).not.toThrow();
        expect(spy).not.toHaveBeenCalled();
    });
});

describe('HandleSignInWhenSignedIn', () => {
    let handleSignIn: HandleSignIn;

    beforeEach(() => {
        jest.clearAllMocks();
        handleSignIn = new HandleSignIn(); 
        handleSignIn.emit = jest.fn();
        handleSignIn['_session'] = new Session();
        handleSignIn['_session_id'] = 'test-session-id';
        SessionManager.ManageSessions();         
    });

    it('should not create a new session if already signed in', () => {
        const spy = jest.spyOn(SessionManager, 'addSession');
        jest.clearAllMocks();
        handleSignIn.signIn();

        expect(Session).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
        expect(handleSignIn['_session']).toBeInstanceOf(Session);
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedIn', expect.any(Session));
    });
});