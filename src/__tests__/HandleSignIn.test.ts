/* eslint-disable */
import { jest, expect } from '@jest/globals';
import Session from '../Handlers/Session.ts';
import HandleSignIn from '../Handlers/HandleSignIn.ts';

const defaultSessionId = "e7b8a6d4-3f2a-4b8a-9f3b-2d6a8e4f9c3e";

jest.mock('../Handlers/Chat.ts');
jest.mock('../Handlers/Feedback.ts');
jest.mock('../Handlers/History.ts');
jest.mock('../Handlers/Settings.ts');
jest.mock('../Models/User.ts');
jest.mock('../Handlers/Session.ts');
jest.mock('../Handlers/Communicator.ts');
jest.mock('../constants.js');

describe('HandleSignIn', () => {
    let handleSignIn: HandleSignIn;

    beforeEach(() => {
        jest.clearAllMocks();
        handleSignIn = new HandleSignIn(); 
        handleSignIn.emit = jest.fn() as unknown as <K>(eventName: string | symbol, ...args: any[]) => boolean;
        });

    it('should initialize with a session_id from cookie', () => {
        const sessionId = (handleSignIn as any)._session_id;
        expect(sessionId).toBe(defaultSessionId);
    });

    it('should sign in and create a new session if not already signed in', () => {
        jest.clearAllMocks();
        jest.unmock('../Handlers/Session.ts');
        handleSignIn.signIn();
        
        expect(Session).toHaveBeenCalledWith(defaultSessionId);
        expect(handleSignIn['_session']).toBeInstanceOf(Session);
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedIn', expect.any(Session));
    });

    it('should sign out and clear the session', () => {
        handleSignIn.signIn();
        handleSignIn.session_id = defaultSessionId;
        expect(handleSignIn.session).toBeInstanceOf(Session);
        
        handleSignIn.signOut();

        const sessionId = (handleSignIn as any)._session_id;
        expect(handleSignIn.session).toBeUndefined();
        expect(sessionId).toBe('');
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedOut', undefined);
    });

    it('should not throw an error if sign out is called without an active session', () => {
        expect(() => handleSignIn.signOut()).not.toThrow();
    });
});

describe('HandleSignInWhenSignedIn', () => {
    let handleSignIn: HandleSignIn;

    beforeEach(() => {
        jest.clearAllMocks();
        handleSignIn = new HandleSignIn(); 
        handleSignIn.emit = jest.fn() as unknown as <K>(eventName: string | symbol, ...args: any[]) => boolean;
        handleSignIn['_session'] = new Session();
        handleSignIn['_session_id'] = 'test-session-id';    
    });

    it('should not create a new session if already signed in', () => {
        jest.clearAllMocks();
        handleSignIn.signIn();

        expect(Session).not.toHaveBeenCalled();

        expect(handleSignIn['_session']).toBeInstanceOf(Session);
        expect(handleSignIn.emit).toHaveBeenCalledWith('signedIn', expect.any(Session));
    });
});